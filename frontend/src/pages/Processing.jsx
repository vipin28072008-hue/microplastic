import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  { label: 'Uploading image to server…',           pct: 15 },
  { label: 'Pre-processing sample frame…',          pct: 35 },
  { label: 'Detecting particle contours…',          pct: 55 },
  { label: 'Identifying microplastics…',            pct: 72 },
  { label: 'Calculating contamination percentage…', pct: 88 },
  { label: 'Generating report…',                    pct: 98 },
]

export default function Processing() {
  const nav = useNavigate()
  const [stepIdx, setStepIdx] = useState(0)
  const [pct, setPct] = useState(0)

  useEffect(() => {
    // safety redirect if user lands here directly (no result ever comes)
    const bail = setTimeout(() => nav('/'), 60000)
    return () => clearTimeout(bail)
  }, [nav])

  // Animate through the step labels
  useEffect(() => {
    if (stepIdx >= STEPS.length - 1) return
    const t = setTimeout(() => setStepIdx(i => i + 1), 900)
    return () => clearTimeout(t)
  }, [stepIdx])

  // Animate progress bar to current step's percentage
  useEffect(() => {
    const target = STEPS[stepIdx].pct
    const step = () => {
      setPct(prev => {
        if (prev >= target) return prev
        return Math.min(prev + 2, target)
      })
    }
    const t = setInterval(step, 20)
    return () => clearInterval(t)
  }, [stepIdx])

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 32, padding: 32,
    }}>
      {/* Spinner */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        border: '3px solid var(--border2)',
        borderTopColor: 'var(--cyan)',
        animation: 'spin .9s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>
          Analysing Sample
        </div>
        <div style={{ color: 'var(--text2)', fontSize: 14, maxWidth: 320 }}>
          Running computer vision pipeline. Please wait…
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{
          height: 4, background: 'var(--border2)',
          borderRadius: 4, overflow: 'hidden', marginBottom: 10,
        }}>
          <div style={{
            height: '100%', background: 'var(--cyan)',
            width: `${pct}%`, transition: 'width .1s linear',
            borderRadius: 4,
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)' }}>
          <span style={{ color: 'var(--text2)', fontWeight: 500 }}>{STEPS[stepIdx].label}</span>
          <span>{pct}%</span>
        </div>
      </div>

      {/* Step list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 380 }}>
        {STEPS.map((s, i) => {
          const done    = i < stepIdx
          const active  = i === stepIdx
          const pending = i > stepIdx
          return (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 'var(--radius)',
              background: active ? 'rgba(0,212,170,.06)' : 'var(--card)',
              border: `1px solid ${active ? 'rgba(0,212,170,.2)' : 'var(--border)'}`,
              fontSize: 13,
              color: done ? 'var(--text3)' : active ? 'var(--text)' : 'var(--text3)',
              transition: 'all .3s ease',
              animation: `fadeUp .3s ${i * 0.08}s ease both`,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                background: done ? 'rgba(0,212,170,.15)' : active ? 'var(--cyan)' : 'var(--border2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: active ? 'pulse 1.2s ease-in-out infinite' : 'none',
              }}>
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : active ? null : null}
              </div>
              <span style={{ textDecoration: done ? 'line-through' : 'none' }}>{s.label}</span>
            </div>
          )
        })}
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:.4;transform:scale(.9)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
