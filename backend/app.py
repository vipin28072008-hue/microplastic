from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import io
import os
from PIL import Image

app = Flask(__name__)
CORS(app)

# ─── Lazy Model Loading ───────────────────────────────────────────────────────
_detection_model = None
_polymer_model   = None
_models_loaded   = False

def get_models():
    global _detection_model, _polymer_model, _models_loaded
    if _models_loaded:
        return _detection_model, _polymer_model
    try:
        import tensorflow as tf
        base = os.path.dirname(__file__)
        det_path  = os.path.join(base, 'microplastic_detection_model.h5')
        poly_path = os.path.join(base, 'microplastic_polymer_model.h5')
        if os.path.exists(det_path):
            _detection_model = tf.keras.models.load_model(det_path)
            print('✅ Detection model loaded')
        else:
            print('⚠️  microplastic_detection_model.h5 not found — using fallback')
        if os.path.exists(poly_path):
            _polymer_model = tf.keras.models.load_model(poly_path)
            print('✅ Polymer model loaded')
        else:
            print('⚠️  microplastic_polymer_model.h5 not found — using fallback')
    except Exception as e:
        print(f'⚠️  Model load error: {e} — using fallback logic')
    _models_loaded = True
    return _detection_model, _polymer_model

LABEL_MAP = {0: 'PE', 1: 'PP', 2: 'PET', 3: 'PS'}
PLASTIC_TYPES = {
    'PE':  {'name': 'Polyethylene',               'source': 'Packaging films, bottles, bags'},
    'PP':  {'name': 'Polypropylene',               'source': 'Textiles, packaging, containers'},
    'PET': {'name': 'Polyethylene Terephthalate',  'source': 'Beverage bottles, food packaging'},
    'PS':  {'name': 'Polystyrene',                 'source': 'Foam products, disposable cutlery'},
}

def analyze_image(img_bgr):
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    cx, cy = w // 2, h // 2
    r = int(min(h, w) * 0.44)
    mask = np.zeros_like(gray)
    cv2.circle(mask, (cx, cy), r, 255, -1)
    masked = cv2.bitwise_and(gray, mask)
    _, thresh = cv2.threshold(masked, 48, 255, cv2.THRESH_BINARY)
    k = np.ones((2, 2), np.uint8)
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, k)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, k)
    contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    particles = []
    plastic_area = 0
    total_area = int(np.pi * r * r)
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if 4 < area < 3000:
            x, y, bw, bh = cv2.boundingRect(cnt)
            perimeter = cv2.arcLength(cnt, True)
            circularity = 4 * np.pi * area / (perimeter ** 2) if perimeter > 0 else 0
            aspect = bw / bh if bh > 0 else 1
            particles.append({
                'area': int(area), 'bbox': (x, y, bw, bh),
                'circularity': round(circularity, 3), 'aspect_ratio': round(aspect, 3),
            })
            plastic_area += area
    return particles, int(plastic_area), total_area, (cx, cy, r)

def cnn_detect(img_bgr, particles, det_model):
    if det_model is None or not particles:
        return len(particles) > 3, 0.0
    h, w = img_bgr.shape[:2]
    votes = []
    for p in particles[:20]:
        x, y, bw, bh = p['bbox']
        pad = 4
        patch = img_bgr[max(0,y-pad):min(h,y+bh+pad), max(0,x-pad):min(w,x+bw+pad)]
        if patch.size == 0: continue
        patch_norm = cv2.resize(cv2.cvtColor(patch, cv2.COLOR_BGR2RGB), (64, 64)).astype(np.float32) / 255.0
        score = float(det_model.predict(patch_norm[np.newaxis], verbose=0)[0][0])
        votes.append(score)
    if not votes:
        return len(particles) > 3, 0.0
    avg = float(np.mean(votes))
    return avg > 0.5 or len(particles) > 3, avg

def cnn_classify_polymer(img_bgr, particles, poly_model):
    if poly_model is None or not particles:
        return _fallback_classify(particles)
    h, w = img_bgr.shape[:2]
    largest = max(particles, key=lambda p: p['area'])
    x, y, bw, bh = largest['bbox']
    pad = 8
    patch = img_bgr[max(0,y-pad):min(h,y+bh+pad), max(0,x-pad):min(w,x+bw+pad)]
    if patch.size == 0:
        return _fallback_classify(particles)
    patch_norm = cv2.resize(cv2.cvtColor(patch, cv2.COLOR_BGR2RGB), (64, 64)).astype(np.float32) / 255.0
    probs = poly_model.predict(patch_norm[np.newaxis], verbose=0)[0]
    idx = int(np.argmax(probs))
    return LABEL_MAP[idx], round(float(probs[idx]) * 100, 1)

def _fallback_classify(particles):
    if not particles:
        return 'PE', 82.0
    avg_circ = float(np.mean([p['circularity']  for p in particles]))
    avg_asp  = float(np.mean([p['aspect_ratio'] for p in particles]))
    if   avg_circ > 0.72: ptype = 'PE'
    elif avg_asp  > 2.5:  ptype = 'PET'
    elif avg_circ < 0.35: ptype = 'PS'
    else:                 ptype = 'PP'
    return ptype, 78.0

def draw_annotated(img_bgr, particles, cx, cy, r):
    vis = img_bgr.copy()
    cv2.circle(vis, (cx, cy), r, (0, 220, 180), 1)
    for p in particles:
        x, y, bw, bh = p['bbox']
        cv2.rectangle(vis, (x, y), (x+bw, y+bh), (0, 210, 140), 1)
    cv2.putText(vis, f"Particles: {len(particles)}", (10, 24),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
    return vis

def img_to_b64(img_rgb):
    buf = io.BytesIO()
    Image.fromarray(img_rgb).save(buf, format='JPEG', quality=88)
    return base64.b64encode(buf.getvalue()).decode()

@app.route('/api/health', methods=['GET'])
def health():
    det_model, poly_model = get_models()
    return jsonify({
        'status': 'ok', 'version': '2.0',
        'detection_model': 'loaded' if det_model  is not None else 'fallback',
        'polymer_model':   'loaded' if poly_model is not None else 'fallback',
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    try:
        det_model, poly_model = get_models()
        nparr = np.frombuffer(request.files['image'].read(), np.uint8)
        img   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({'error': 'Could not decode image file'}), 400
        img = cv2.resize(img, (563, 537))
        particles, plastic_area, total_area, (cx, cy, r) = analyze_image(img)
        detected, _ = cnn_detect(img, particles, det_model)
        ptype, conf = cnn_classify_polymer(img, particles, poly_model) if detected else ('PE', 0.0)
        percentage  = round(min((plastic_area / total_area) * 100 * 6, 100), 2)
        if   percentage < 10: risk, risk_hex = 'Low',    '#22c55e'
        elif percentage < 30: risk, risk_hex = 'Medium', '#f59e0b'
        else:                 risk, risk_hex = 'High',   '#ef4444'
        ann_rgb = cv2.cvtColor(draw_annotated(img, particles, cx, cy, r), cv2.COLOR_BGR2RGB)
        return jsonify({
            'detected':        detected,
            'microplastic':    'Detected' if detected else 'Not Detected',
            'percentage':      percentage,
            'plastic_area_px': plastic_area,
            'total_area_px':   total_area,
            'particle_count':  len(particles),
            'plastic_type':    ptype,
            'plastic_name':    PLASTIC_TYPES[ptype]['name'],
            'plastic_source':  PLASTIC_TYPES[ptype]['source'],
            'confidence':      conf,
            'risk_level':      risk,
            'risk_hex':        risk_hex,
            'annotated_image': img_to_b64(ann_rgb),
            'model_status':    'ai_model' if det_model is not None else 'fallback',
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
