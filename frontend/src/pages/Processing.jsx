import { useState, useEffect } from 'react'

const STEPS = [
  { label: 'Uploading image',             sub: 'Transferring file to analysis server' },
  { label: 'Grayscale conversion',        sub: 'Preparing image for thresholding' },
  { label: 'Threshold & morphology',      sub: 'Isolating bright particles on dark background' },
  { label: 'Contour detection',           sub: 'Identifying and measuring particle boundaries' },
  { label: 'Polymer classification',      sub: 'CNN model inferring plastic type' },
  { label: 'Percentage calculation',      sub: 'Plastic area / total area formula' },
  { label: 'Report generation',           sub: 'Compiling final results' },
]

export default function Processing() {
  const [step, setStep]         = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let s = 0; let p = 0
    const iv = setInterval(() => {
      p += 1
      setProgress(p)
      const threshold = Math.round(((s + 1) / STEPS.length) * 100)
      if (p >= threshold && s < STEPS.length - 1) { s++; setStep(s) }
      if (p >= 98) clearInterval(iv)
    }, 55)
    return () => clearInterval(iv)
  }, [])

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 32px',
      background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,212,170,0.04), transparent)',
    }}>
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>

        {/* Spinner */}
        <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 32px' }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid var(--border)',
            borderTopColor: 'var(--cyan)',
            animation: 'spin 1s linear infinite',
          }} />
          <div style={{
            position: 'absolute', inset: 8, borderRadius: '50%',
            border: '1.5px solid var(--border)',
            borderBottomColor: 'var(--cyan)',
            animation: 'spin 1.6s linear infinite reverse',
            opacity: .5,
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--cyan)', animation: 'glow 1.5s ease-in-out infinite' }} />
          </div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 6, letterSpacing: '-.3px' }}>
          Analysing sample
        </h2>
        <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 32 }}>
          Do not close this tab
        </p>

        {/* Progress bar */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>Progress</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--cyan)' }}>{progress}%</span>
          </div>
          <div style={{ background: 'var(--border)', borderRadius: 99, height: 4, overflow: 'hidden' }}>
            <div style={{
              width: `${progress}%`, height: '100%',
              background: 'var(--cyan)',
              borderRadius: 99,
              transition: 'width .15s linear',
              boxShadow: '0 0 8px var(--cyan-mid)',
            }} />
          </div>
        </div>

        {/* Step list */}
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STEPS.map((s, i) => {
            const done   = i < step
            const active = i === step
            return (
              <div key={i} style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                padding: '12px 0',
                borderBottom: i < STEPS.length - 1 ? '1px solid var(--border)' : 'none',
                opacity: i > step ? .35 : 1,
                transition: 'opacity .3s',
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? 'rgba(34,197,94,.15)' : active ? 'var(--cyan-dim)' : 'var(--card2)',
                  border: `1px solid ${done ? 'rgba(34,197,94,.4)' : active ? 'var(--cyan-mid)' : 'var(--border)'}`,
                  transition: 'all .3s',
                  fontSize: 10, fontWeight: 700,
                  color: done ? 'var(--success)' : active ? 'var(--cyan)' : 'var(--text3)',
                }}>
                  {done ? '✓' : i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? 'var(--text)' : 'var(--text2)', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.sub}</div>
                </div>
                {active && (
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 3, paddingTop: 4 }}>
                    {[0,1,2].map(j => (
                      <div key={j} style={{
                        width: 4, height: 4, borderRadius: '50%',
                        background: 'var(--cyan)',
                        animation: `blink .8s ease-in-out infinite`,
                        animationDelay: `${j * 0.18}s`,
                      }} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
