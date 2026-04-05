import { useNavigate } from 'react-router-dom'

export default function Home() {
  const nav = useNavigate()

  const features = [
    { icon: '🔬', title: 'AI Detection', desc: 'Deep learning model trained on thousands of water sample images to identify microplastic particles.' },
    { icon: '📊', title: 'Detailed Analysis', desc: 'Get particle count, concentration estimates, and size distribution from your sample.' },
    { icon: '📄', title: 'PDF Report', desc: 'Download a professional report with findings, visualizations, and recommendations.' },
  ]

  return (
    <div style={{ padding: '64px 32px', maxWidth: 900, margin: '0 auto' }}>

      {/* Hero */}
      <div className="anim-1" style={{ textAlign: 'center', marginBottom: 64 }}>
        <div style={{
          display: 'inline-block', background: 'var(--cyan-dim)',
          border: '1px solid rgba(0,212,170,.2)', borderRadius: 20,
          padding: '5px 14px', fontSize: 12, color: 'var(--cyan)',
          fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase',
          marginBottom: 22,
        }}>
          AI-Powered Water Analysis
        </div>

        <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-1.5px', marginBottom: 20 }}>
          Detect Microplastics<br />
          <span style={{ color: 'var(--cyan)' }}>Instantly & Accurately</span>
        </h1>

        <p style={{ color: 'var(--text2)', fontSize: 17, maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Upload a photograph of your water sample and our AI model will identify and quantify microplastic contamination in seconds.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => nav('/upload')} style={{ fontSize: 15, padding: '12px 28px' }}>
            Start Analysis
          </button>
          <button className="btn btn-ghost" onClick={() => nav('/upload')} style={{ fontSize: 15, padding: '12px 28px' }}>
            Learn More
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="anim-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
        {features.map(f => (
          <div key={f.title} className="card-sm" style={{ padding: 22 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', marginBottom: 8 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="anim-4" style={{
        marginTop: 40, display: 'flex', gap: 0,
        border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        overflow: 'hidden', background: 'var(--card)',
        flexWrap: 'wrap',
      }}>
        {[
          { value: '94.8%', label: 'Detection Accuracy' },
          { value: '<2s',   label: 'Analysis Time' },
          { value: '15+',   label: 'Plastic Types' },
          { value: 'Free',  label: 'Always Free' },
        ].map((s, i, arr) => (
          <div key={s.label} style={{
            flex: '1 1 120px', padding: '22px 20px', textAlign: 'center',
            borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cyan)', marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
