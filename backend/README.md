# MicroPlastic Detector

AI-powered microplastic detection from water sample images.

## Stack
- Frontend: React + Vite + React Router
- Backend:  Python + Flask
- CV:       OpenCV + NumPy
- Report:   jsPDF

## Run locally

### Backend (Terminal 1)
```bash
cd backend
pip install -r requirements.txt
python app.py
# http://localhost:5000
```

### Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

---

## Deploy online

### Recommended: Vercel (frontend) + Render (backend)

#### 1. Backend → Render
1. Push backend/ to a GitHub repo
2. Go to render.com → New → Web Service
3. Connect repo, set:
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn app:app`
4. Deploy — you get a URL like `https://mpd-backend.onrender.com`

#### 2. Frontend → Vercel
1. In frontend/src/pages/Upload.jsx, change the fetch URL from `/api/predict` to your Render URL:
   ```js
   const res = await fetch('https://mpd-backend.onrender.com/api/predict', ...)
   ```
   Also update the health check URL.
2. Push frontend/ to GitHub
3. Go to vercel.com → New Project → Import repo
4. Framework: Vite — deploy
5. You get a URL like `https://microplastic-detector.vercel.app`

#### Notes
- Render free tier sleeps after 15 min inactivity — first request after sleep takes ~30s to wake up
- Vercel free tier has no such issue
- For always-on backend, use Render paid plan or Railway.app

---

## Replace dummy model

After training CNN on your polarized images:

1. Copy `model.h5` to backend/
2. In `backend/app.py`, replace `classify_type()`:

```python
from tensorflow.keras.models import load_model as load_keras_model
_model = load_keras_model('model.h5')

def classify_type(particles):
    # requires the particle crop or full image passed in
    # adjust based on your training setup
    types = ['PE', 'PP', 'PET', 'PS']
    pred  = _model.predict(your_input_array)
    idx   = int(np.argmax(pred[0]))
    return types[idx], round(float(pred[0][idx]) * 100, 1)
```
