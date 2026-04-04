import { useNavigate } from 'react-router-dom'

function Stat({ label, value, mono, accent }) {
  return (
    <div style={{
      padding: '18px 20px',
      background: 'var(--card2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      flex: 1, minWidth: 120,
    }}>
      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{label}</div>
      <div style={{
        fontSize: 22, fontWeight: 700,
        color: accent || 'var(--text)',
        fontFamily: mono ? 'var(--mono)' : 'Inter, sans-serif',
      }}>{value}</div>
    </div>
  )
}

function Row({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>
      <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: accent || 'var(--text)' }}>{value}</span>
    </div>
  )
}

async function generatePDF(data, originalImage) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  const W   = doc.internal.pageSize.getWidth()
  const now = new Date().toLocaleString()

  // Header
  doc.setFillColor(13, 15, 20)
  doc.rect(0, 0, W, 32, 'F')
  doc.setTextColor(0, 212, 170)
  doc.setFontSize(16); doc.setFont('helvetica', 'bold')
  doc.text('MicroPlastic Detector', 14, 14)
  doc.setTextColor(150, 160, 170)
  doc.setFontSize(9); doc.setFont('helvetica', 'normal')
  doc.text('Analysis Report', 14, 22)
  doc.text(`Generated: ${now}`, W - 14, 22, { align: 'right' })

  // Risk banner
  const rc = data.risk_level === 'High' ? [239,68,68] : data.risk_level === 'Medium' ? [245,158,11] : [34,197,94]
  doc.setFillColor(...rc)
  doc.roundedRect(14, 38, W - 28, 14, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11); doc.setFont('helvetica', 'bold')
  doc.text(`${data.microplastic}  |  Risk: ${data.risk_level}  |  Contamination: ${data.percentage}%`, W / 2, 47, { align: 'center' })

  // Results table
  doc.setTextColor(30, 36, 52)
  doc.setFontSize(12); doc.setFont('helvetica', 'bold')
  doc.text('Detection Results', 14, 66)

  const rows = [
    ['Microplastic',          data.microplastic],
    ['Contamination (%)',     `${data.percentage}%`],
    ['Particle Count',        `${data.particle_count}`],
    ['Polymer Type',          `${data.plastic_type} — ${data.plastic_name}`],
    ['Model Confidence',      `${data.confidence}%`],
    ['Risk Level',            data.risk_level],
    ['Plastic Area (px)',     `${data.plastic_area_px}`],
    ['Total Sample Area (px)',`${data.total_area_px}`],
  ]

  let y = 72
  rows.forEach(([label, val], i) => {
    doc.setFillColor(i % 2 === 0 ? 245 : 252, i % 2 === 0 ? 247 : 252, i % 2 === 0 ? 250 : 252)
    doc.rect(14, y, W - 28, 9, 'F')
    doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 100, 120)
    doc.text(label, 18, y + 6.5)
    doc.setFont('helvetica', 'bold'); doc.setTextColor(20, 30, 50)
    doc.text(val, W - 18, y + 6.5, { align: 'right' })
    y += 9
  })

  // Formula
  y += 8
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 120, 100)
  doc.text('Calculation Formula', 14, y)
  y += 6
  doc.setFillColor(230, 250, 245)
  doc.roundedRect(14, y, W - 28, 10, 2, 2, 'F')
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 100, 80)
  doc.text('Microplastic (%) = ( Plastic Area (px) / Total Sample Area (px) ) x 100', W / 2, y + 7, { align: 'center' })
  y += 16

  // Images
  if (originalImage) {
    try {
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 36, 52)
      doc.text('Original Image', 14, y + 4)
      doc.addImage(originalImage, 'JPEG', 14, y + 8, 80, 55)
    } catch {}
  }
  if (data.annotated_image) {
    try {
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 36, 52)
      doc.text('Annotated Image — Detected Particles', 104, y + 4)
      doc.addImage(`data:image/jpeg;base64,${data.annotated_image}`, 'JPEG', 104, y + 8, 90, 55)
    } catch {}
  }
  y += 70

  // Conclusion
  const CONC = {
    Low:    'The water sample shows low microplastic contamination. Contamination is within the accepted threshold. Continued periodic monitoring is advised.',
    Medium: 'The water sample shows moderate microplastic contamination. Treatment is recommended before use. Investigate potential contamination sources.',
    High:   'The water sample shows high microplastic contamination. The sample may be unsafe for consumption or contact. Immediate treatment and source investigation are required.',
  }
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 36, 52)
  doc.text('Conclusion', 14, y + 8)
  doc.setFillColor(...rc.map(v => Math.min(v + 200, 255)))
  doc.roundedRect(14, y + 12, W - 28, 22, 3, 3, 'F')
  doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 36, 52)
  const lines = doc.splitTextToSize(CONC[data.risk_level] || '', W - 36)
  doc.text(lines, 18, y + 21)

  // Footer
  const pH = doc.internal.pageSize.getHeight()
  doc.setFillColor(13, 15, 20)
  doc.rect(0, pH - 12, W, 12, 'F')
  doc.setTextColor(80, 100, 110)
  doc.setFontSize(8)
  doc.text('MicroPlastic Detector — Polarized Optical Sensing + CNN Classification — Prototype v1.0', W / 2, pH - 4, { align: 'center' })

  doc.save(`MPD_Report_${Date.now()}.pdf`)
}

export default function Result({ data, originalImage }) {
  const nav = useNavigate()

  if (!data) { nav('/'); return null }

  if (data.error) {
    return (
      <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 22 }}>!</div>
        <h2 style={{ color: 'var(--danger)', fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Analysis failed</h2>
        <p style={{ color: 'var(--text2)', maxWidth: 420, fontSize: 14, lineHeight: 1.6, marginBottom: 10 }}>{data.error}</p>
        <p style={{ color: 'var(--text3)', fontSize: 12, marginBottom: 28 }}>
          Ensure the backend is running: <code style={{ background: 'var(--card2)', padding: '2px 6px', borderRadius: 4, color: 'var(--cyan)' }}>python app.py</code>
        </p>
        <button className="btn btn-primary" onClick={() => nav('/upload')}>Try Again</button>
      </div>
    )
  }

  const riskColor = data.risk_level === 'High' ? 'var(--danger)' : data.risk_level === 'Medium' ? 'var(--warn)' : 'var(--success)'
  const riskBg    = data.risk_level === 'High' ? 'rgba(239,68,68,.08)' : data.risk_level === 'Medium' ? 'rgba(245,158,11,.08)' : 'rgba(34,197,94,.08)'
  const riskBd    = data.risk_level === 'High' ? 'rgba(239,68,68,.25)' : data.risk_level === 'Medium' ? 'rgba(245,158,11,.25)' : 'rgba(34,197,94,.25)'

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', padding: '40px 32px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div className="anim-1" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, fontSize: 13, color: 'var(--text3)' }}>
          <span style={{ cursor: 'pointer', color: 'var(--text2)' }} onClick={() => nav('/')}>Home</span>
          <span>/</span>
          <span style={{ cursor: 'pointer', color: 'var(--text2)' }} onClick={() => nav('/upload')}>Upload</span>
          <span>/</span>
          <span style={{ color: 'var(--cyan)' }}>Results</span>
        </div>

        <div className="anim-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-.4px' }}>Analysis Results</h1>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 4 }}>Completed — {new Date().toLocaleString()}</p>
          </div>
          <span className="tag" style={{ background: riskBg, color: riskColor, border: `1px solid ${riskBd}` }}>
            {data.risk_level} Risk
          </span>
        </div>

        {/* Detection status */}
        <div className="anim-2" style={{ background: riskBg, border: `1px solid ${riskBd}`, borderRadius: 'var(--radius-lg)', padding: '18px 22px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: riskColor, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: riskColor }}>{data.microplastic}</div>
            <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 2 }}>
              {data.detected
                ? `${data.particle_count} particles identified — ${data.plastic_name} (${data.plastic_type})`
                : 'No significant microplastic contamination detected in this sample'}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="anim-3" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <Stat label="Contamination"  value={`${data.percentage}%`}  mono accent={riskColor} />
          <Stat label="Polymer Type"   value={data.plastic_type}       mono accent="var(--cyan)" />
          <Stat label="Confidence"     value={`${data.confidence}%`}   mono accent="var(--text)" />
          <Stat label="Particles"      value={data.particle_count}     mono />
        </div>

        {/* Detail table */}
        <div className="anim-4 card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Detailed measurements</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>
            Formula: Microplastic % = (Plastic Area / Total Area) &times; 100
          </div>
          <div>
            <Row label="Plastic area (px)"        value={data.plastic_area_px} />
            <Row label="Total sample area (px)"   value={data.total_area_px} />
            <Row label="Contamination percentage" value={`${data.percentage}%`}  accent={riskColor} />
            <Row label="Particle count"           value={data.particle_count} />
            <Row label="Polymer type"             value={`${data.plastic_type} — ${data.plastic_name}`} accent="var(--cyan)" />
            <Row label="Common source"            value={data.plastic_source || '—'} />
            <Row label="Model confidence"         value={`${data.confidence}%`} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>Risk level</span>
              <span className="tag mono" style={{ fontSize: 12, fontWeight: 600, background: riskBg, color: riskColor, border: `1px solid ${riskBd}` }}>{data.risk_level}</span>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="anim-5" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          {[
            ['Original',               originalImage],
            ['Annotated (particles)',  `data:image/jpeg;base64,${data.annotated_image}`],
          ].map(([label, src]) => (
            <div key={label} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 500, color: 'var(--text2)' }}>{label}</div>
              {src
                ? <img src={src} alt={label} style={{ width: '100%', display: 'block', maxHeight: 190, objectFit: 'cover' }} />
                : <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 12 }}>Not available</div>
              }
            </div>
          ))}
        </div>

        {/* Risk conclusion */}
        <div style={{ background: riskBg, border: `1px solid ${riskBd}`, borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ fontWeight: 600, color: riskColor, fontSize: 13, marginBottom: 6 }}>Conclusion — {data.risk_level} contamination</div>
          <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7 }}>
            {data.risk_level === 'High'   && 'The sample shows high microplastic contamination. The water may be unsafe for consumption or contact. Immediate treatment and source investigation are required.'}
            {data.risk_level === 'Medium' && 'The sample shows moderate microplastic contamination. Treatment is recommended before use. Periodic monitoring and contamination source identification are advised.'}
            {data.risk_level === 'Low'    && 'The sample shows low microplastic contamination. Levels are within acceptable range. Continue periodic monitoring.'}
            {!data.detected               && 'No significant microplastic contamination was detected in this sample.'}
          </div>
        </div>

        {/* Model note */}
        <div className="card-sm" style={{ marginBottom: 28, fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
          <span style={{ color: 'var(--warn)', fontWeight: 600 }}>Prototype note:</span> Polymer classification currently uses a heuristic placeholder. Replace with trained CNN model after hardware setup and dataset collection.
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => generatePDF(data, originalImage)} style={{ flex: 1, minWidth: 160 }}>
            Download Report (PDF)
          </button>
          <button className="btn btn-outline" onClick={() => nav('/upload')} style={{ flex: 1, minWidth: 160 }}>
            Analyse Another Sample
          </button>
          <button className="btn btn-ghost" onClick={() => nav('/')} style={{ flex: '0 0 auto' }}>
            Home
          </button>
        </div>

      </div>
    </div>
  )
}
