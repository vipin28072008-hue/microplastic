import { useNavigate } from 'react-router-dom'

const capabilities = [
  { label: 'Particle Detection',    desc: 'Identifies microplastic particles using thresholding and contour analysis on polarized images' },
  { label: 'Polymer Classification', desc: 'CNN model classifies polymer type — PE, PP, PET — from particle morphology and optical signature' },
  { label: 'Area Quantification',   desc: 'Calculates contamination percentage using plastic area vs total sample area formula' },
  { label: 'Risk Assessment',       desc: 'Assigns Low / Medium / High risk based on contamination threshold logic' },
]

const pipeline = [
  ['01', 'Image Input',       'Macro-lens water sample image captured under cross-polarized light'],
  ['02', 'Pre-processing',    'Grayscale conversion, thresholding, morphological filtering'],
  ['03', 'Particle Analysis', 'Contour detection, area measurement, shape feature extraction'],
  ['04', 'Classification',    'CNN model infers polymer type from particle morphology'],
  ['05', 'Output',            'Contamination %, polymer type, confidence score, risk level'],
]

const techStack = [
  ['Frontend',    'React, Vite, React Router'],
  ['Backend',     'Python, Flask, REST API'],
  ['Processing',  'OpenCV, NumPy'],
  ['ML Model',    'TensorFlow, Keras (CNN)'],
  ['Report',      'jsPDF'],
  ['Deploy',      'Vercel + Render'],
]

export default function Home() {
  const nav = useNavigate()
  return (
    <div>

      {/* Hero */}
      <section style={{
        padding: '96px 32px 80px',
        maxWidth: 900, margin: '0 auto',
        position: 'relative',
      }}>
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: .25,
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
        }} />

        <div style={{ position: 'relative' }}>
          <div className="anim-1" style={{ marginBottom: 20 }}>
            <span className="tag" style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)', border: '1px solid var(--cyan-mid)' }}>
              Polarized Optical Sensing + CNN
            </span>
          </div>

          <h1 className="anim-2" style={{
            fontSize: 'clamp(36px, 5vw, 60px)',
            fontWeight: 800, lineHeight: 1.08,
            letterSpacing: '-1.5px',
            color: 'var(--text)',
            marginBottom: 22,
          }}>
            Microplastic Detection<br />
            <span style={{ color: 'var(--cyan)' }}>in Water Samples</span>
          </h1>

          <p className="anim-3" style={{
            fontSize: 16, color: 'var(--text2)',
            maxWidth: 560, lineHeight: 1.75,
            marginBottom: 36,
          }}>
            Upload a macro-lens image of a water sample. The system detects microplastic particles,
            identifies polymer type, and quantifies contamination percentage using image analysis.
          </p>

          <div className="anim-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => nav('/upload')} style={{ padding: '12px 28px', fontSize: 15 }}>
              Run Analysis
            </button>
            <button className="btn btn-ghost" onClick={() => document.getElementById('pipeline').scrollIntoView({ behavior: 'smooth' })}>
              View Pipeline
            </button>
          </div>

          {/* Stat row */}
          <div className="anim-5" style={{
            display: 'flex', gap: 0, flexWrap: 'wrap',
            marginTop: 56,
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
          }}>
            {[
              ['PE / PP / PET / PS', 'Polymer types'],
              ['Area formula',       'Quantification method'],
              ['OpenCV + CNN',       'Detection pipeline'],
              ['PDF export',         'Report format'],
            ].map(([val, label], i) => (
              <div key={i} style={{
                flex: 1, minWidth: 140,
                padding: '16px 20px',
                borderRight: i < 3 ? '1px solid var(--border)' : 'none',
              }}>
                <div className="mono" style={{ color: 'var(--cyan)', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{val}</div>
                <div style={{ color: 'var(--text3)', fontSize: 11 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section style={{ padding: '64px 32px', maxWidth: 900, margin: '0 auto' }}>
        <p className="section-label">Capabilities</p>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 32, letterSpacing: '-.5px' }}>
          What the system does
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1, border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {capabilities.map((c, i) => (
            <div key={i} style={{
              padding: '24px',
              background: 'var(--card)',
              borderRight: i % 2 === 0 ? '1px solid var(--border)' : 'none',
              borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ width: 28, height: 2, background: 'var(--cyan)', borderRadius: 99, marginBottom: 14 }} />
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 8 }}>{c.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section id="pipeline" style={{ padding: '64px 32px', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p className="section-label">Pipeline</p>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 36, letterSpacing: '-.5px' }}>
            Analysis pipeline
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {pipeline.map(([num, title, desc], i) => (
              <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'flex-start', padding: '20px 0', borderBottom: i < pipeline.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="mono" style={{ color: 'var(--text3)', fontSize: 12, fontWeight: 500, width: 28, flexShrink: 0, paddingTop: 2 }}>{num}</div>
                <div style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section style={{ padding: '64px 32px', maxWidth: 900, margin: '0 auto' }}>
        <p className="section-label">Stack</p>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 32, letterSpacing: '-.5px' }}>
          Technology stack
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {techStack.map(([layer, tools]) => (
            <div key={layer} className="card-sm" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1 }}>{layer}</div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--cyan)', fontWeight: 500 }}>{tools}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 12, letterSpacing: '-.5px' }}>
            Ready to analyse a sample?
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28, lineHeight: 1.7 }}>
            Upload a macro-lens image and receive contamination analysis in seconds.
          </p>
          <button className="btn btn-primary" onClick={() => nav('/upload')} style={{ padding: '12px 32px', fontSize: 15 }}>
            Run Analysis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '20px 32px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <span style={{ color: 'var(--text3)', fontSize: 12 }}>MicroPlastic Detector — Polarized Optical Sensing + CNN Classification — Prototype v1.0</span>
      </footer>

    </div>
  )
}
