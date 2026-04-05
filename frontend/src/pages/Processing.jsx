import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Processing() {
  const nav = useNavigate()

  // safety redirect if user lands here directly
  useEffect(() => {
    const t = setTimeout(() => nav('/'), 30000)
    return () => clearTimeout(t)
  }, [nav])

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 24, padding: 32,
    }}>
      {/* Spinner */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        border: '3px solid var(--border2)',
        borderTopColor: 'var(--cyan)',
        animation: 'spin .9s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>Analysing Sample…</div>
        <div style={{ color: 'var(--text2)', fontSize: 14 }}>Running AI detection model. This takes a few seconds.</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 320 }}>
        {['Loading model weights', 'Pre-processing image', 'Running inference', 'Counting particles'].map((step, i) => (
          <div key={step} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 'var(--radius)',
            background: 'var(--card)', border: '1px solid var(--border)',
            fontSize: 13, color: 'var(--text2)',
            animation: `fadeUp .4s ${i * 0.15}s ease both`,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--cyan)',
              animation: `pulse 1.2s ${i * 0.3}s ease-in-out infinite`,
            }} />
            {step}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
