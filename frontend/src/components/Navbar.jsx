import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const nav = useNavigate()
  return (
    <nav style={{
      height: 56, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 28px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg2)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div
        onClick={() => nav('/')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'linear-gradient(135deg, #00d4aa, #0099ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0d10" strokeWidth="2.2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M12 8v4M12 12h4"/>
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-.3px', color: 'var(--text)' }}>
          MicroPlastic <span style={{ color: 'var(--cyan)' }}>Detector</span>
        </span>
      </div>

      <button className="btn btn-ghost" onClick={() => nav('/upload')} style={{ fontSize: 13, padding: '7px 16px' }}>
        Analyse Sample
      </button>
    </nav>
  )
}
