from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import random
import base64
import io
from PIL import Image

app = Flask(__name__)
CORS(app)

PLASTIC_TYPES = {
    'PE':  {'name': 'Polyethylene',               'source': 'Packaging films, bottles, bags'},
    'PP':  {'name': 'Polypropylene',               'source': 'Textiles, packaging, containers'},
    'PET': {'name': 'Polyethylene Terephthalate',  'source': 'Beverage bottles, food packaging'},
    'PS':  {'name': 'Polystyrene',                 'source': 'Foam products, disposable cutlery'},
}

def analyze_image(img_array):
    gray = cv2.cvtColor(img_array, cv2.COLOR_BGR2GRAY)
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
                'contour': cnt,
                'area': int(area),
                'bbox': (x, y, bw, bh),
                'circularity': round(circularity, 3),
                'aspect_ratio': round(aspect, 3),
            })
            plastic_area += area

    return particles, int(plastic_area), total_area, (cx, cy, r)

def classify_type(particles):
    # DUMMY — replace with real CNN after hardware + dataset
    if not particles:
        return 'PE', 85.0
    avg_circ = np.mean([p['circularity'] for p in particles])
    avg_asp  = np.mean([p['aspect_ratio'] for p in particles])
    if avg_circ > 0.70:   ptype = 'PE'
    elif avg_circ > 0.50: ptype = 'PP'
    elif avg_asp  > 2.00: ptype = 'PET'
    else:                 ptype = 'PS'
    confidence = round(random.uniform(76, 94), 1)
    return ptype, confidence

def draw_annotated(img_array, particles, cx, cy, r):
    vis = img_array.copy()
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

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'version': '1.0'})

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
        particles, plastic_area, total_area, (cx, cy, r) = analyze_image(img)
        ptype, confidence = classify_type(particles)

        percentage = round(min((plastic_area / total_area) * 100 * 6, 100), 2)
        detected   = len(particles) > 3

        if percentage < 10:   risk = 'Low';    risk_hex = '#22c55e'
        elif percentage < 30: risk = 'Medium'; risk_hex = '#f59e0b'
        else:                 risk = 'High';   risk_hex = '#ef4444'

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
            'confidence':      confidence,
            'risk_level':      risk,
            'risk_hex':        risk_hex,
            'annotated_image': img_to_b64(ann_rgb),
            'model_status':    'prototype',
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
