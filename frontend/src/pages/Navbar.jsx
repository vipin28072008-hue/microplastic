import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const nav = useNavigate()
  const loc = useLocation()

  const links = [
    { label: 'Home',   path: '/' },
    { label: 'Upload', path: '/upload' },
  ]

  return (
    <nav style={{
      height: 56, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 28px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg2)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div onClick={() => nav('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'linear-gradient(135deg, #00d4aa, #0099ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Microscope-style icon */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0a0d10" strokeWidth="2.3">
            <circle cx="12" cy="12" r="2"/>
            <path d="M4.93 4.93l4.24 4.24"/>
            <path d="M14.83 9.17l4.24-4.24"/>
            <path d="M14.83 14.83l4.24 4.24"/>
            <path d="M9.17 14.83l-4.24 4.24"/>
            <circle cx="12" cy="12" r="8"/>
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-.3px', color: 'var(--text)' }}>
          MicroPlastic <span style={{ color: 'var(--cyan)' }}>Detector</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {links.map(l => (
          <button
            key={l.path}
            onClick={() => nav(l.path)}
            style={{
              background: 'transparent',
              border: 'none',
              color: loc.pathname === l.path ? 'var(--text)' : 'var(--text3)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: loc.pathname === l.path ? 600 : 400,
              fontSize: 13,
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: 6,
              transition: 'color .15s, background .15s',
            }}
            onMouseEnter={e => e.target.style.background = 'var(--card2)'}
            onMouseLeave={e => e.target.style.background = 'transparent'}
          >
            {l.label}
          </button>
        ))}
        <button className="btn btn-primary" onClick={() => nav('/upload')} style={{ fontSize: 13, padding: '7px 16px', marginLeft: 8 }}>
          Analyse Sample
        </button>
      </div>
    </nav>
  )
}
