import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(13,15,20,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      height: 56,
      display: 'flex', alignItems: 'center',
      padding: '0 32px',
      justifyContent: 'space-between',
    }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28,
          border: '1.5px solid var(--cyan)',
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--cyan)' }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', letterSpacing: '-.2px' }}>
          MicroPlastic<span style={{ color: 'var(--cyan)' }}> Detector</span>
        </span>
      </Link>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {[['/', 'Home'], ['/upload', 'Analyse']].map(([path, label]) => (
          <Link key={path} to={path} style={{
            textDecoration: 'none',
            fontSize: 13, fontWeight: 500,
            padding: '6px 14px', borderRadius: 'var(--radius)',
            color: pathname === path ? 'var(--cyan)' : 'var(--text2)',
            background: pathname === path ? 'var(--cyan-dim)' : 'transparent',
            transition: 'all .15s',
          }}>{label}</Link>
        ))}
        <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 8px' }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 99,
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.2)',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', animation: 'blink 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 500 }}>System Online</span>
        </div>
      </div>
    </nav>
  )
}
