from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import io
import os
from PIL import Image
import tensorflow as tf

app = Flask(__name__)
CORS(app)

# ── Load CNN Models at startup ─────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
detection_model = tf.keras.models.load_model(
    os.path.join(BASE_DIR, 'microplastic_detection_model.h5')
)
polymer_model = tf.keras.models.load_model(
    os.path.join(BASE_DIR, 'microplastic_polymer_model.h5')
)

# ── Constants ─────────────────────────────────────────────────────────
PLASTIC_TYPES = {
    'PE':  {'name': 'Polyethylene',              'source': 'Packaging films, bottles, bags'},
    'PP':  {'name': 'Polypropylene',              'source': 'Textiles, packaging, containers'},
    'PET': {'name': 'Polyethylene Terephthalate', 'source': 'Beverage bottles, food packaging'},
    'PS':  {'name': 'Polystyrene',                'source': 'Foam products, disposable cutlery'},
}
POLYMER_LABELS = ['PE', 'PP', 'PET', 'PS']

# ── Helper: prepare a 64x64 patch for the CNN ─────────────────────────
def prepare_patch(img_bgr, bbox):
    x, y, bw, bh = bbox
    patch = img_bgr[y:y+bh, x:x+bw]
    if patch.size == 0:
        patch = img_bgr
    patch_rgb = cv2.cvtColor(patch, cv2.COLOR_BGR2RGB)
    patch_resized = cv2.resize(patch_rgb, (64, 64))
    patch_norm = patch_resized.astype(np.float32) / 255.0
    return np.expand_dims(patch_norm, axis=0)  # shape: (1, 64, 64, 3)

# ── OpenCV Analysis ───────────────────────────────────────────────────
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

    particles    = []
    plastic_area = 0
    total_area   = int(np.pi * r * r)

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if 4 < area < 3000:
            x, y, bw, bh = cv2.boundingRect(cnt)
            perimeter   = cv2.arcLength(cnt, True)
            circularity = 4 * np.pi * area / (perimeter ** 2) if perimeter > 0 else 0
            aspect      = bw / bh if bh > 0 else 1
            particles.append({
                'area':         int(area),
                'bbox':         (x, y, bw, bh),
                'circularity':  round(circularity, 3),
                'aspect_ratio': round(aspect, 3),
            })
            plastic_area += area

    return particles, int(plastic_area), total_area, (cx, cy, r)


# ── CNN-based Detection + Classification ─────────────────────────────
def cnn_detect_and_classify(img_bgr, particles):
    """
    Uses the detection CNN to confirm each particle is real microplastic.
    Uses the polymer CNN on the largest confirmed particle to classify type.
    Returns: (confirmed_particles, polymer_type, confidence)
    """
    if not particles:
        return [], 'PE', 0.0

    confirmed = []
    for p in particles:
        patch = prepare_patch(img_bgr, p['bbox'])
        score = float(detection_model.predict(patch, verbose=0)[0][0])
        if score >= 0.5:  # sigmoid output: >= 0.5 means microplastic
            p['cnn_score'] = round(score, 3)
            confirmed.append(p)

    if not confirmed:
        return [], 'PE', 0.0

    # Run polymer classification on the largest confirmed particle
    largest = max(confirmed, key=lambda p: p['area'])
    patch = prepare_patch(img_bgr, largest['bbox'])
    probs = polymer_model.predict(patch, verbose=0)[0]  # shape: (4,)
    idx   = int(np.argmax(probs))
    ptype = POLYMER_LABELS[idx]
    conf  = round(float(probs[idx]) * 100, 1)

    return confirmed, ptype, conf


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


# ── Routes ────────────────────────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'version': '3.0', 'model': 'opencv+cnn'})


@app.route('/api/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    try:
        nparr = np.frombuffer(request.files['image'].read(), np.uint8)
        img   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({'error': 'Could not decode image file'}), 400

        img = cv2.resize(img, (563, 537))

        # Step 1: OpenCV finds candidate particles
        particles, plastic_area, total_area, (cx, cy, r) = analyze_image(img)

        # Step 2: CNN confirms particles and classifies polymer
        confirmed, ptype, conf = cnn_detect_and_classify(img, particles)

        detected   = len(confirmed) > 0
        percentage = round(min((plastic_area / total_area) * 100 * 6, 100), 2) if detected else 0.0

        if   percentage < 10: risk, risk_hex = 'Low',    '#22c55e'
        elif percentage < 30: risk, risk_hex = 'Medium', '#f59e0b'
        else:                 risk, risk_hex = 'High',   '#ef4444'

        ann_rgb = cv2.cvtColor(draw_annotated(img, confirmed, cx, cy, r), cv2.COLOR_BGR2RGB)

        return jsonify({
            'detected':        detected,
            'microplastic':    'Detected' if detected else 'Not Detected',
            'percentage':      percentage,
            'plastic_area_px': plastic_area,
            'total_area_px':   total_area,
            'particle_count':  len(confirmed),
            'plastic_type':    ptype if detected else 'PE',
            'plastic_name':    PLASTIC_TYPES[ptype]['name'] if detected else '',
            'plastic_source':  PLASTIC_TYPES[ptype]['source'] if detected else '',
            'confidence':      conf,
            'risk_level':      risk,
            'risk_hex':        risk_hex,
            'annotated_image': img_to_b64(ann_rgb),
            'model_status':    'opencv+cnn',
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
