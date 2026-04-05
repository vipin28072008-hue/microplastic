import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'

export default function Result({ result, preview }) {
  const nav = useNavigate()

  const isError = !!result?.error
  const detected   = result?.microplastic_detected ?? result?.detected ?? false
  const confidence = result?.confidence ?? result?.confidence_score ?? null
  const count      = result?.particle_count ?? result?.count ?? null
  const label      = result?.label ?? (detected ? 'Microplastics Detected' : 'No Microplastics Detected')
  const details    = result?.details ?? result?.message ?? ''

  const pct = confidence != null ? Math.round(Number(confidence) * 100) : null

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('MicroPlastic Detector — Analysis Report', 14, 22)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32)
    doc.setTextColor(0)
    doc.setFontSize(14)
    doc.text('Result', 14, 46)
    doc.setFontSize(12)
    doc.text(`Status:     ${label}`, 14, 56)
    if (pct != null)   doc.text(`Confidence: ${pct}%`, 14, 64)
    if (count != null) doc.text(`Particles:  ${count}`, 14, 72)
    if (details)       doc.text(`Details:    ${details}`, 14, 80)
    if (preview) {
      doc.addPage()
      doc.setFontSize(14)
      doc.text('Sample Image', 14, 20)
      doc.addImage(preview, 'JPEG', 14, 28, 180, 120)
    }
    doc.save('microplastic-report.pdf')
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', padding: '48px 32px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        <div className="anim-1" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, fontSize: 13, color: 'var(--text3)' }}>
          <span style={{ cursor: 'pointer', color: 'var(--text2)' }} onClick={() => nav('/')}>Home</span>
          <span>/</span>
          <span style={{ color: 'var(--cyan)' }}>Result</span>
        </div>

        {isError ? (
          <div className="anim-2 card-sm" style={{ borderColor: 'rgba(239,68,68,.3)', marginBottom: 24 }}>
            <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 6 }}>Analysis Failed</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>{result.error}</div>
          </div>
        ) : (
          <>
            {/* Main result card */}
            <div className="anim-2" style={{
              background: detected ? 'rgba(239,68,68,.06)' : 'rgba(0,212,170,.06)',
              border: `1px solid ${detected ? 'rgba(239,68,68,.25)' : 'rgba(0,212,170,.25)'}`,
              borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: detected ? 'rgba(239,68,68,.15)' : 'rgba(0,212,170,.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {detected ? '⚠️' : '✅'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)', marginBottom: 4 }}>{label}</div>
                  {details && <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{details}</div>}
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="anim-3" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {pct != null && (
                <div className="card-sm" style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--cyan)' }}>{pct}%</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Confidence</div>
                </div>
              )}
              {count != null && (
                <div className="card-sm" style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{count}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Particles</div>
                </div>
              )}
            </div>

            {/* Preview */}
            {preview && (
              <div className="anim-4" style={{ marginBottom: 20, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={preview} alt="sample" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} />
              </div>
            )}

            {/* Raw JSON */}
            <details className="anim-4" style={{ marginBottom: 20 }}>
              <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--text3)', userSelect: 'none', marginBottom: 8 }}>
                Raw API response
              </summary>
              <pre style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: 14,
                fontSize: 12, color: 'var(--text2)',
                overflow: 'auto', fontFamily: 'JetBrains Mono, monospace',
              }}>{JSON.stringify(result, null, 2)}</pre>
            </details>
          </>
        )}

        {/* Actions */}
        <div className="anim-5" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={() => nav('/upload')} style={{ flex: '1 1 140px' }}>
            New Analysis
          </button>
          {!isError && (
            <button className="btn btn-primary" onClick={downloadPDF} style={{ flex: '1 1 140px' }}>
              Download PDF
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
