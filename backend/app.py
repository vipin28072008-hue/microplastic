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

# ─── Load Models ──────────────────────────────────────────────────────────────
# Models are loaded once at startup for performance
import tensorflow as tf

DETECTION_MODEL = None
POLYMER_MODEL   = None

def load_models():
    global DETECTION_MODEL, POLYMER_MODEL
    det_path  = os.path.join(os.path.dirname(__file__), 'microplastic_detection_model.h5')
    poly_path = os.path.join(os.path.dirname(__file__), 'microplastic_polymer_model.h5')

    if os.path.exists(det_path):
        DETECTION_MODEL = tf.keras.models.load_model(det_path)
        print('✅ Detection model loaded')
    else:
        print('⚠️  Detection model NOT found — using fallback logic')

    if os.path.exists(poly_path):
        POLYMER_MODEL = tf.keras.models.load_model(poly_path)
        print('✅ Polymer model loaded')
    else:
        print('⚠️  Polymer model NOT found — using fallback logic')

load_models()

# ─── Constants ────────────────────────────────────────────────────────────────
LABEL_MAP = {0: 'PE', 1: 'PP', 2: 'PET', 3: 'PS'}

PLASTIC_TYPES = {
    'PE':  {'name': 'Polyethylene',               'source': 'Packaging films, bottles, bags'},
    'PP':  {'name': 'Polypropylene',               'source': 'Textiles, packaging, containers'},
    'PET': {'name': 'Polyethylene Terephthalate',  'source': 'Beverage bottles, food packaging'},
    'PS':  {'name': 'Polystyrene',                 'source': 'Foam products, disposable cutlery'},
}

# ─── Image Analysis ───────────────────────────────────────────────────────────
def analyze_image(img_bgr):
    """OpenCV contour analysis — returns particles, areas, and sample region."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    cx, cy = w // 2, h // 2
    r = int(min(h, w) * 0.44)

    # Mask to circular sample region
    mask = np.zeros_like(gray)
    cv2.circle(mask, (cx, cy), r, 255, -1)
    masked = cv2.bitwise_and(gray, mask)

    # Threshold + morphological cleanup
    _, thresh = cv2.threshold(masked, 48, 255, cv2.THRESH_BINARY)
    k = np.ones((2, 2), np.uint8)
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, k)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, k)

    contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    particles    = []
    plastic_area = 0
    total_area   = int(np.pi * r * r)

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if 4 < area < 3000:
            x, y, bw, bh = cv2.boundingRect(cnt)
            perimeter     = cv2.arcLength(cnt, True)
            circularity   = 4 * np.pi * area / (perimeter ** 2) if perimeter > 0 else 0
            aspect        = bw / bh if bh > 0 else 1
            particles.append({
                'contour':      cnt,
                'area':         int(area),
                'bbox':         (x, y, bw, bh),
                'circularity':  round(circularity, 3),
                'aspect_ratio': round(aspect, 3),
            })
            plastic_area += area

    return particles, int(plastic_area), total_area, (cx, cy, r)


def cnn_detect(img_bgr, particles):
    """Run CNN detection model on particle patches.
    Returns (detected: bool, detection_confidence: float)"""
    if DETECTION_MODEL is None or not particles:
        # Fallback: use particle count heuristic
        detected = len(particles) > 3
        return detected, 0.0

    h, w = img_bgr.shape[:2]
    votes = []

    for p in particles[:20]:  # Sample up to 20 particles
        x, y, bw, bh = p['bbox']
        pad = 4
        x1 = max(0, x - pad);  y1 = max(0, y - pad)
        x2 = min(w, x+bw+pad); y2 = min(h, y+bh+pad)
        patch = img_bgr[y1:y2, x1:x2]
        if patch.size == 0:
            continue
        patch_rgb  = cv2.cvtColor(cv2.resize(patch, (64, 64)), cv2.COLOR_BGR2RGB)
        patch_norm = patch_rgb.astype(np.float32) / 255.0
        score = float(DETECTION_MODEL.predict(patch_norm[np.newaxis], verbose=0)[0][0])
        votes.append(score)

    if not votes:
        return len(particles) > 3, 0.0

    detection_score = float(np.mean(votes))
    detected = detection_score > 0.5 or len(particles) > 3
    return detected, detection_score


def cnn_classify_polymer(img_bgr, particles):
    """Run polymer type CNN on the largest detected particle patch.
    Returns (polymer_type: str, confidence: float)"""
    if POLYMER_MODEL is None or not particles:
        return _fallback_classify(particles)

    h, w   = img_bgr.shape[:2]
    largest = max(particles, key=lambda p: p['area'])
    x, y, bw, bh = largest['bbox']
    pad = 8
    x1 = max(0, x - pad);   y1 = max(0, y - pad)
    x2 = min(w, x+bw+pad);  y2 = min(h, y+bh+pad)
    patch = img_bgr[y1:y2, x1:x2]

    if patch.size == 0:
        return _fallback_classify(particles)

    patch_rgb  = cv2.cvtColor(cv2.resize(patch, (64, 64)), cv2.COLOR_BGR2RGB)
    patch_norm = patch_rgb.astype(np.float32) / 255.0
    probs      = POLYMER_MODEL.predict(patch_norm[np.newaxis], verbose=0)[0]
    poly_idx   = int(np.argmax(probs))
    ptype      = LABEL_MAP[poly_idx]
    confidence = round(float(probs[poly_idx]) * 100, 1)
    return ptype, confidence


def _fallback_classify(particles):
    """Morphology-based fallback when model file is not available."""
    if not particles:
        return 'PE', 85.0
    avg_circ = float(np.mean([p['circularity'] for p in particles]))
    avg_asp  = float(np.mean([p['aspect_ratio'] for p in particles]))
    if avg_circ > 0.72:  ptype = 'PE'
    elif avg_asp  > 2.5: ptype = 'PET'
    elif avg_circ < 0.35: ptype = 'PS'
    else:                ptype = 'PP'
    return ptype, 78.0


def draw_annotated(img_bgr, particles, cx, cy, r):
    """Draw bounding boxes and sample region on image."""
    vis = img_bgr.copy()
    cv2.circle(vis, (cx, cy), r, (0, 220, 180), 1)
    for p in particles:
        x, y, bw, bh = p['bbox']
        cv2.rectangle(vis, (x, y), (x+bw, y+bh), (0, 210, 140), 1)
    cv2.putText(vis, f"Particles: {len(particles)}", (10, 24),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
    return vis


def img_to_b64(img_rgb):
    pil = Image.fromarray(img_rgb)
    buf = io.BytesIO()
    pil.save(buf, format='JPEG', quality=88)
    return base64.b64encode(buf.getvalue()).decode()


# ─── Routes ───────────────────────────────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status':           'ok',
        'version':          '2.0',
        'detection_model':  'loaded' if DETECTION_MODEL  is not None else 'fallback',
        'polymer_model':    'loaded' if POLYMER_MODEL    is not None else 'fallback',
    })


@app.route('/api/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    try:
        file  = request.files['image']
        nparr = np.frombuffer(file.read(), np.uint8)
        img   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({'error': 'Could not decode image file'}), 400

        img = cv2.resize(img, (563, 537))

        # Step 1: OpenCV particle detection
        particles, plastic_area, total_area, (cx, cy, r) = analyze_image(img)

        # Step 2: CNN detection confirmation
        detected, det_confidence = cnn_detect(img, particles)

        # Step 3: CNN polymer classification
        ptype, confidence = cnn_classify_polymer(img, particles) if detected else ('PE', 0.0)

        # Step 4: Compute metrics
        percentage = round(min((plastic_area / total_area) * 100 * 6, 100), 2)

        if percentage < 10:   risk = 'Low';    risk_hex = '#22c55e'
        elif percentage < 30: risk = 'Medium'; risk_hex = '#f59e0b'
        else:                 risk = 'High';   risk_hex = '#ef4444'

        # Step 5: Annotated image
        ann_bgr = draw_annotated(img, particles, cx, cy, r)
        ann_rgb = cv2.cvtColor(ann_bgr, cv2.COLOR_BGR2RGB)

        return jsonify({
            'detected':         detected,
            'microplastic':     'Detected' if detected else 'Not Detected',
            'percentage':       percentage,
            'plastic_area_px':  plastic_area,
            'total_area_px':    total_area,
            'particle_count':   len(particles),
            'plastic_type':     ptype,
            'plastic_name':     PLASTIC_TYPES[ptype]['name'],
            'plastic_source':   PLASTIC_TYPES[ptype]['source'],
            'confidence':       confidence,
            'risk_level':       risk,
            'risk_hex':         risk_hex,
            'annotated_image':  img_to_b64(ann_rgb),
            'model_status':     'ai_model' if DETECTION_MODEL is not None else 'fallback',
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
