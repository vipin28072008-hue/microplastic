import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'

const PLASTIC_INFO = {
  PE:  { full: 'Polyethylene',              source: 'Packaging films, bottles, bags' },
  PP:  { full: 'Polypropylene',             source: 'Textiles, packaging, containers' },
  PET: { full: 'Polyethylene Terephthalate', source: 'Beverage bottles, food packaging' },
  PS:  { full: 'Polystyrene',               source: 'Foam products, disposable cutlery' },
}

function RiskBadge({ level }) {
  const map = {
    Low:    { bg: 'rgba(34,197,94,.12)',  border: 'rgba(34,197,94,.3)',  color: '#22c55e' },
    Medium: { bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.3)', color: '#f59e0b' },
    High:   { bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.3)',  color: '#ef4444' },
  }
  const s = map[level] || map.Low
  return (
    <span style={{
      display: 'inline-block',
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700,
      letterSpacing: '.3px',
    }}>
      {level} Risk
    </span>
  )
}

function Metric({ label, value, sub, color }) {
  return (
    <div className="card-sm" style={{ flex: '1 1 100px', textAlign: 'center', padding: '16px 12px' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || 'var(--cyan)', marginBottom: 3 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{sub}</div>}
    </div>
  )
}

export default function Result({ result, preview }) {
  const nav = useNavigate()

  if (!result) {
    nav('/')
    return null
  }

  const isError = !!result?.error

  // Map API fields correctly
  const detected       = result?.detected ?? false
  const microplastic   = result?.microplastic ?? (detected ? 'Detected' : 'Not Detected')
  const percentage     = result?.percentage ?? 0
  const plasticType    = result?.plastic_type ?? 'PE'
  const plasticName    = result?.plastic_name ?? PLASTIC_INFO[plasticType]?.full ?? plasticType
  const plasticSource  = result?.plastic_source ?? PLASTIC_INFO[plasticType]?.source ?? ''
  const confidence     = result?.confidence ?? 0
  const riskLevel      = result?.risk_level ?? 'Low'
  const particleCount  = result?.particle_count ?? 0
  const annotatedImg   = result?.annotated_image ? `data:image/jpeg;base64,${result.annotated_image}` : preview

  const riskConclusions = {
    Low:    'Water sample shows low microplastic contamination. Particle concentration is within generally acceptable environmental thresholds.',
    Medium: 'Water sample shows moderate microplastic contamination. Further investigation and source tracing is recommended.',
    High:   'Water sample shows high microplastic contamination and may be unsafe for ecological and human contact. Immediate remediation assessment is advised.',
  }
  const conclusion = riskConclusions[riskLevel] || riskConclusions.Low

  const riskColors = { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444' }
  const riskColor  = riskColors[riskLevel] || '#22c55e'

  const downloadPDF = () => {
    const doc = new jsPDF()
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })

    // Header bar
    doc.setFillColor(13, 15, 20)
    doc.rect(0, 0, 210, 28, 'F')
    doc.setTextColor(0, 212, 170)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('MicroPlastic Detector', 14, 12)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(139, 146, 168)
    doc.text('Water Sample Analysis Report', 14, 20)

    // Meta
    doc.setTextColor(80, 80, 80)
    doc.setFontSize(9)
    doc.text(`Generated: ${now}`, 14, 36)

    // Divider
    doc.setDrawColor(30, 35, 48)
    doc.line(14, 40, 196, 40)

    // Section: Detection Summary
    doc.setTextColor(0, 212, 170)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('DETECTION SUMMARY', 14, 50)

    const rows = [
      ['Microplastic', microplastic],
      ['Contamination', `${percentage}%`],
      ['Particle Count', `${particleCount} particles detected`],
      ['Dominant Polymer', `${plasticType} — ${plasticName}`],
      ['Polymer Source', plasticSource],
      ['Classification Confidence', `${confidence}%`],
      ['Risk Level', `${riskLevel}`],
    ]

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    let y = 60
    rows.forEach(([k, v]) => {
      doc.setTextColor(100, 100, 120)
      doc.text(k, 14, y)
      doc.setTextColor(30, 30, 30)
      doc.text(v, 80, y)
      y += 9
    })

    // Risk level colored indicator
    if (riskLevel === 'High')        doc.setTextColor(239, 68, 68)
    else if (riskLevel === 'Medium') doc.setTextColor(245, 158, 11)
    else                             doc.setTextColor(34, 197, 94)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(`◉ ${riskLevel} Risk`, 80, y - 9)

    // Conclusion
    doc.setDrawColor(200, 200, 200)
    doc.line(14, y + 4, 196, y + 4)
    doc.setTextColor(0, 212, 170)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('CONCLUSION', 14, y + 14)
    doc.setTextColor(50, 50, 50)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(conclusion, 176)
    doc.text(lines, 14, y + 24)

    // Sample Image
    if (annotatedImg || preview) {
      doc.addPage()
      doc.setFillColor(13, 15, 20)
      doc.rect(0, 0, 210, 16, 'F')
      doc.setTextColor(0, 212, 170)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('ANNOTATED SAMPLE IMAGE', 14, 11)
      doc.addImage(annotatedImg || preview, 'JPEG', 14, 22, 182, 130)
      doc.setTextColor(100, 100, 120)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('Green bounding boxes indicate detected microplastic particle candidates. Teal circle marks the analysed sample region.', 14, 158, { maxWidth: 182 })
    }

    // Footer
    const pages = doc.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(`MicroPlastic Detector · Page ${i} of ${pages}`, 14, 290)
    }

    doc.save('microplastic-analysis-report.pdf')
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', padding: '48px 32px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 580 }}>

        {/* Breadcrumb */}
        <div className="anim-1" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, fontSize: 13, color: 'var(--text3)' }}>
          <span style={{ cursor: 'pointer', color: 'var(--text2)' }} onClick={() => nav('/')}>Home</span>
          <span>/</span>
          <span style={{ cursor: 'pointer', color: 'var(--text2)' }} onClick={() => nav('/upload')}>Upload</span>
          <span>/</span>
          <span style={{ color: 'var(--cyan)' }}>Results</span>
        </div>

        {isError ? (
          <div className="anim-2 card-sm" style={{ borderColor: 'rgba(239,68,68,.3)', marginBottom: 24 }}>
            <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 6 }}>Analysis Failed</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{result.error}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 10 }}>
              The backend server may be sleeping (free-tier cold start). Wait 30 seconds and try again.
            </div>
          </div>
        ) : (
          <>
            {/* Status banner */}
            <div className="anim-2" style={{
              background: detected ? 'rgba(239,68,68,.06)' : 'rgba(0,212,170,.06)',
              border: `1px solid ${detected ? 'rgba(239,68,68,.25)' : 'rgba(0,212,170,.25)'}`,
              borderRadius: 'var(--radius-lg)', padding: '20px 22px', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                background: detected ? 'rgba(239,68,68,.12)' : 'rgba(0,212,170,.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>
                {detected ? '⚠️' : '✅'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)', marginBottom: 4 }}>
                  Microplastics {microplastic}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RiskBadge level={riskLevel} />
                  {detected && (
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                      {particleCount} particle{particleCount !== 1 ? 's' : ''} identified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Metrics row */}
            <div className="anim-3" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <Metric label="Contamination" value={`${percentage}%`} sub="of sample area" color={riskColor} />
              <Metric label="Polymer Type" value={plasticType} sub={plasticName} />
              <Metric label="Confidence" value={`${confidence}%`} sub="classification score" />
            </div>

            {/* Polymer detail */}
            {detected && (
              <div className="anim-3 card-sm" style={{ marginBottom: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  flexShrink: 0, width: 38, height: 38, borderRadius: 8,
                  background: 'rgba(0,212,170,.08)', border: '1px solid rgba(0,212,170,.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>🧪</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>
                    Dominant Polymer — {plasticType} ({plasticName})
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
                    Common sources: {plasticSource}
                  </div>
                </div>
              </div>
            )}

            {/* Annotated image */}
            {(annotatedImg || preview) && (
              <div className="anim-4" style={{ marginBottom: 16, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--card2)', fontSize: 12, color: 'var(--text3)' }}>
                  {annotatedImg ? 'Annotated Sample — detected particles highlighted' : 'Uploaded Sample'}
                </div>
                <img src={annotatedImg || preview} alt="sample" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', display: 'block', background: '#0a0d10' }} />
              </div>
            )}

            {/* Conclusion */}
            <div className="anim-4 card-sm" style={{ marginBottom: 20, borderLeft: `3px solid ${riskColor}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: riskColor, letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 6 }}>Conclusion</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{conclusion}</div>
            </div>

            {/* Risk scale reference */}
            <div className="anim-4 card-sm" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>Risk Level Reference</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { label: 'Low',    range: '0–10%',  color: '#22c55e' },
                  { label: 'Medium', range: '10–30%', color: '#f59e0b' },
                  { label: 'High',   range: '>30%',   color: '#ef4444' },
                ].map(r => (
                  <div key={r.label} style={{
                    flex: 1, padding: '8px 10px', borderRadius: 6,
                    background: riskLevel === r.label ? `${r.color}18` : 'transparent',
                    border: `1px solid ${riskLevel === r.label ? r.color + '44' : 'var(--border)'}`,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: r.color, marginBottom: 2 }}>{r.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>{r.range}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="anim-5" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={() => nav('/')} style={{ flex: '0 0 auto' }}>
            Home
          </button>
          <button className="btn btn-ghost" onClick={() => nav('/upload')} style={{ flex: '1 1 130px' }}>
            Analyse Another Sample
          </button>
          {!isError && (
            <button className="btn btn-primary" onClick={downloadPDF} style={{ flex: '1 1 130px' }}>
              Download Report
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
