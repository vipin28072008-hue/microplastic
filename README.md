# 🔬 Microplastic Detection in Water Using Polarized Optical Sensing

> A low-cost, portable microplastic detection system combining cross-polarized optical imaging with CNN-based machine learning — deployed as a full-stack web application.

**🌐 Live Demo:** https://microplastic-erg3.vercel.app/

---

## 📌 Overview

Microplastic contamination in water bodies has emerged as a critical environmental and public health concern. Conventional detection methods like FTIR and Raman spectroscopy are accurate but cost ₹15,00,000–₹50,00,000 and require laboratory infrastructure — making them completely inaccessible for field or community-level monitoring.

This project presents a **portable, field-deployable microplastic detection system** built under ₹2,000 that exploits the **birefringent optical property** of synthetic polymer particles. Under cross-polarized light, microplastic particles glow bright against a dark background — allowing reliable detection without any chemical treatment.

---

## ✨ Features

- 🔦 **Cross-polarized optical detection** — exploits birefringence of synthetic polymers
- 🧪 **Density separation protocol** — using saturated K₂CO₃ solution (density ~1.5 g/cm³)
- 📷 **Smartphone-based imaging** — 12MP camera with clip-on macro lens
- 🤖 **AI detection pipeline** — OpenCV contour analysis + CNN-based classification
- 🧬 **Polymer classification** — identifies PE, PP, PET, or PS with confidence score
- 📊 **Risk level assessment** — Low / Medium / High contamination rating
- 📄 **Downloadable PDF report** — full analysis report per sample
- 🌐 **Web application** — accessible from any device with a browser

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite), deployed on Vercel |
| Backend | Flask (Python), deployed on Render |
| Image Processing | OpenCV 4.10 |
| Machine Learning | TensorFlow / Keras — CNN model |
| Training Data | Kaggle Microplastic Dataset (781 images) |
| Training Environment | Google Colab (T4 GPU) |

---

## 🔬 How It Works

Water Sample → Density Separation → Filter Paper → Cross-Polarized Imaging
→ Smartphone Capture → Upload to Web App → OpenCV Processing
→ CNN Detection & Classification → Result Report


**Stage 1 — Optical Detection**
Two linear polarizing films are placed at 90° to each other. The white LED illuminates the sample through the first polarizer. Birefringent microplastic particles rotate the polarization of light — appearing bright against the dark background created by the crossed polarizers. Organic matter remains dark.

**Stage 2 — AI Pipeline**
OpenCV applies binary thresholding (threshold: 48), morphological operations, and contour detection to isolate bright particles. A CNN then confirms each detected particle and classifies the dominant polymer type using softmax probability output.

---

## 📁 Project Structure

```
microplastic/
├── backend/
│   ├── app.py                          # Flask API — OpenCV + CNN pipeline
│   ├── requirements.txt                # Python dependencies
│   ├── microplastic_detection_model.h5 # Trained CNN — binary detection
│   └── microplastic_polymer_model.h5   # Trained CNN — polymer classification
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Upload.jsx
    │   │   ├── Processing.jsx
    │   │   └── Result.jsx
    │   └── App.jsx
    └── package.json
```

---

## 🚀 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| POST | `/api/predict` | Upload image, get full analysis |

**Sample Response:**
```json
{
  "detected": true,
  "microplastic": "Detected",
  "percentage": 2.78,
  "particle_count": 21,
  "plastic_type": "PP",
  "plastic_name": "Polypropylene",
  "confidence": 72.1,
  "risk_level": "Low",
  "annotated_image": "<base64>"
}
```

---

## 🧪 Hardware Components

| Component | Specification |
|-----------|--------------|
| LED Light Source | 5W–10W, 5000–6500K cool white |
| Polarizing Films | Linear, extinction ratio ≥ 1:500 (×2) |
| Camera | Smartphone ≥ 12MP with manual focus |
| Macro Lens | 10×–20× clip-on |
| Sample Substrate | Whatman Grade 1 filter paper |
| Separation Chemical | Saturated K₂CO₃ solution |

---
```
