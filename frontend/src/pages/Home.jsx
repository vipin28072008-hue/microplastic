import { useNavigate } from 'react-router-dom'

export default function Home() {
  const nav = useNavigate()

  const features = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.8">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          <circle cx="11" cy="11" r="3"/>
        </svg>
      ),
      title: 'Polarized Light Analysis',
      desc: 'Leverages birefringence — the optical signature of synthetic polymers under cross-polarized illumination — the same principle used in peer-reviewed microplastic research.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
        </svg>
      ),
      title: 'Polymer Classification',
      desc: 'Identifies dominant polymer types — PE, PP, PET, and PS — using morphological feature extraction (circularity, aspect ratio) derived from contour analysis.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
      title: 'Structured PDF Report',
      desc: 'Generates a downloadable report with annotated sample image, contamination percentage, polymer type, confidence score, risk classification, and interpretive conclusion.',
    },
  ]

  const steps = [
    { num: '01', label: 'Upload Sample Image', desc: 'Provide a macro-lens photograph of a water sample captured under cross-polarized illumination.' },
    { num: '02', label: 'Computer Vision Pipeline Runs', desc: 'OpenCV segments the sample area, detects particle contours, filters noise, and extracts morphological features.' },
    { num: '03', label: 'Review Results', desc: 'Examine contamination percentage, particle count, dominant polymer type, confidence score, and risk level.' },
    { num: '04', label: 'Download Report', desc: 'Export a structured PDF with all findings, the annotated sample image, and a risk-based interpretive conclusion.' },
  ]

  return (
    <div style={{ padding: '64px 32px', maxWidth: 920, margin: '0 auto' }}>

      {/* Hero */}
      <div className="anim-1" style={{ textAlign: 'center', marginBottom: 72 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'var(--cyan-dim)',
          border: '1px solid rgba(0,212,170,.2)', borderRadius: 20,
          padding: '5px 14px', fontSize: 12, color: 'var(--cyan)',
          fontWeight: 600, letterSpacing: '.6px', textTransform: 'uppercase',
          marginBottom: 24,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', display: 'inline-block' }} />
          Polarized Light · OpenCV · Computer Vision
        </div>

        <h1 style={{ fontSize: 'clamp(28px,5vw,50px)', fontWeight: 800, lineHeight: 1.12, letterSpacing: '-1.5px', marginBottom: 20 }}>
          Microplastic Detection<br />
          <span style={{ color: 'var(--cyan)' }}>from Water Sample Images</span>
        </h1>

        <p style={{ color: 'var(--text2)', fontSize: 16, maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.75 }}>
          Upload a cross-polarized microscope image of a water sample. The system detects birefringent
          microplastic particles, estimates contamination percentage, classifies polymer type, and
          generates a structured risk report.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => nav('/upload')} style={{ fontSize: 15, padding: '13px 32px' }}>
            Start Analysis
          </button>
          <button className="btn btn-ghost" onClick={() => {
            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
          }} style={{ fontSize: 15, padding: '13px 28px' }}>
            How It Works
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="anim-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(255px,1fr))', gap: 14, marginBottom: 48 }}>
        {features.map(f => (
          <div key={f.title} className="card-sm" style={{ padding: 24 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'rgba(0,212,170,.08)', border: '1px solid rgba(0,212,170,.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
            }}>
              {f.icon}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 8 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="anim-3" style={{
        display: 'flex', gap: 0,
        border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        overflow: 'hidden', background: 'var(--card)',
        flexWrap: 'wrap', marginBottom: 64,
      }}>
        {[
          { value: '4',      label: 'Polymer Types',       sub: 'PE · PP · PET · PS' },
          { value: '~80%',   label: 'Detection Accuracy',  sub: 'Polarized light basis' },
          { value: 'DOLP',   label: 'Key Optical Feature', sub: 'Degree of linear polarization' },
          { value: 'OpenCV', label: 'Vision Engine',       sub: 'Contour-based detection' },
        ].map((s, i, arr) => (
          <div key={s.label} style={{
            flex: '1 1 130px', padding: '22px 16px', textAlign: 'center',
            borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--cyan)', marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600, marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div id="how-it-works" className="anim-4">
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: 'var(--cyan)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>Workflow</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.5px' }}>How the Analysis Works</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {steps.map((s, i) => (
            <div key={s.num} style={{ display: 'flex', gap: 18, padding: '18px 0', borderBottom: i < steps.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--cyan)', letterSpacing: '.5px', minWidth: 24, paddingTop: 2 }}>{s.num}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Methodology note */}
        <div style={{
          marginTop: 40,
          background: 'rgba(0,212,170,.04)',
          border: '1px solid rgba(0,212,170,.15)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 22px',
        }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--cyan)', marginBottom: 8 }}>Methodology Note</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.75 }}>
            Particle detection uses OpenCV contour analysis on threshold-segmented, morphologically cleaned grayscale frames.
            Polymer classification is based on mean circularity and aspect ratio of detected contours — a morphological
            proxy for the birefringence-pattern analysis described in polarized-light literature (Saur et al., 2025; Li et al., 2024).
            Contamination percentage is computed as the ratio of total particle area to the analysed circular sample-window area.
            This is a prototype implementation; production-grade polymer classification requires a CNN trained on labelled
            polarized-light microscopy datasets.
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="anim-5" style={{ textAlign: 'center', marginTop: 64 }}>
        <button className="btn btn-primary" onClick={() => nav('/upload')} style={{ fontSize: 15, padding: '13px 40px' }}>
          Upload a Sample →
        </button>
      </div>
    </div>
  )
}
