import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'https://microplastic-sqhu.onrender.com'

export default function Upload({ onResult }) {
  const [drag, setDrag]       = useState(false)
  const [file, setFile]       = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef()
  const nav = useNavigate()

  const accept = useCallback((f) => {
    if (!f) return
    if (!f.type.startsWith('image/')) { setError('File must be an image — JPG or PNG.'); return }
    if (f.size > 20 * 1024 * 1024)   { setError('File size must be under 20 MB.'); return }
    setError('')
    setFile(f)
    const r = new FileReader()
    r.onload = e => setPreview(e.target.result)
    r.readAsDataURL(f)
  }, [])

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false)
    accept(e.dataTransfer.files[0])
  }

  const submit = async () => {
    if (!file) { setError('Select an image first.'); return }
    setLoading(true)
    nav('/processing')
    const form = new FormData()
    form.append('image', file)
    try {
      const res  = await fetch(`${API}/api/predict`, { method: 'POST', body: form })
      const data = await res.json()
      onResult(data, preview)
      nav('/result')
    } catch {
      onResult({ error: 'Could not connect to the backend server. The server may be waking up — wait 30 seconds and try again.' }, preview)
      nav('/result')
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', padding: '48px 32px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Breadcrumb */}
        <div className="anim-1" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, fontSize: 13, color: 'var(--text3)' }}>
          <span style={{ cursor: 'pointer', color: 'var(--text2)' }} onClick={() => nav('/')}>Home</span>
          <span>/</span>
          <span style={{ color: 'var(--cyan)' }}>Upload Sample</span>
        </div>

        <h1 className="anim-1" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 6, letterSpacing: '-.5px' }}>
          Upload Water Sample
        </h1>
        <p className="anim-2" style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28, lineHeight: 1.65 }}>
          Provide a macro-lens photograph of a water sample captured under cross-polarized illumination.
          Birefringent particles appear bright against a dark background, enabling accurate detection.
        </p>

        {/* Drop zone */}
        <div
          className="anim-3"
          onClick={() => !file && inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          style={{
            border: `1.5px dashed ${drag ? 'var(--cyan)' : file ? '#00d4aa66' : 'var(--border2)'}`,
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            cursor: file ? 'default' : 'pointer',
            transition: 'border-color .2s',
            marginBottom: 16,
            background: drag ? 'var(--cyan-dim)' : 'var(--card)',
          }}
        >
          {preview ? (
            <div style={{ position: 'relative' }}>
              <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(13,15,20,.85) 0%, transparent 50%)',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'flex-end', padding: 16,
              }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#fff', marginBottom: 2 }}>{file.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>{(file.size / 1024).toFixed(0)} KB — ready to analyse</div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setFile(null); setPreview(null) }}
                style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'rgba(13,15,20,.8)', border: '1px solid var(--border2)',
                  color: 'var(--text2)', borderRadius: 6, padding: '4px 10px',
                  fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
              >Remove</button>
            </div>
          ) : (
            <div style={{ padding: '52px 24px', textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                border: '1.5px solid var(--border2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', background: 'var(--card2)',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 6 }}>
                {drag ? 'Release to upload' : 'Drag and drop image here'}
              </div>
              <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 18 }}>or</div>
              <button className="btn btn-ghost" onClick={e => { e.stopPropagation(); inputRef.current.click() }} style={{ fontSize: 13 }}>
                Browse Files
              </button>
              <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 14 }}>JPG, PNG — max 20 MB</div>
            </div>
          )}
        </div>

        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => accept(e.target.files[0])} />

        {error && (
          <div style={{
            background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)',
            borderRadius: 'var(--radius)', padding: '10px 14px',
            color: 'var(--danger)', fontSize: 13, marginBottom: 14,
          }}>{error}</div>
        )}

        {/* Image requirements */}
        <div className="anim-4 card-sm" style={{ marginBottom: 24, fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>
          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 8, fontSize: 13 }}>Image capture requirements</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { icon: '🔬', text: 'Cross-polarized illumination — birefringent particles must be visible' },
              { icon: '📐', text: 'Macro or microscope lens — particle details should be clearly resolved' },
              { icon: '🧫', text: 'Sample on filter paper or glass slide for a clean background' },
              { icon: '💡', text: 'Stable, even lighting with minimal motion blur or overexposure' },
            ].map(r => (
              <div key={r.text} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{r.icon}</span>
                <span>{r.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="anim-5" style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => nav('/')} style={{ flex: '0 0 auto' }}>Back</button>
          <button className="btn btn-primary" onClick={submit} disabled={!file || loading} style={{ flex: 1, fontSize: 15 }}>
            {loading ? 'Submitting…' : 'Analyse Sample'}
          </button>
        </div>

      </div>
    </div>
  )
}
