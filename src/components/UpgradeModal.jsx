import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || '/api'

export default function UpgradeModal({ onClose, onUnlock, dailyUsed = false }) {
  const [plan, setPlan] = useState('annual')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleUpgrade = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Could not start checkout. Try again.')
        setLoading(false)
      }
    } catch {
      setError('Could not reach server. Make sure it is running.')
      setLoading(false)
    }
  }

  const monthlyEquiv = plan === 'annual' ? '$2.50' : '$4.99'
  const saving = plan === 'annual' ? 'Save 50%' : null

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()} className="card-in">

        {/* Header */}
        <div style={s.header}>
          <div style={s.icon}>💀</div>
          <h2 style={s.title}>
            {dailyUsed ? "You've used today's free decode" : "You've used your 3 free reads"}
          </h2>
          <p style={s.sub}>
            {dailyUsed
              ? 'Come back tomorrow for one free decode, or go Pro for unlimited.'
              : 'Upgrade to Pro for unlimited decodes — and share cards you can post anywhere.'}
          </p>
        </div>

        {/* Plan toggle */}
        <div style={s.planToggle}>
          <button
            style={{ ...s.toggleBtn, ...(plan === 'monthly' ? s.toggleBtnActive : {}) }}
            onClick={() => setPlan('monthly')}
          >
            Monthly
          </button>
          <button
            style={{ ...s.toggleBtn, ...(plan === 'annual' ? s.toggleBtnActive : {}) }}
            onClick={() => setPlan('annual')}
          >
            Annual {saving && <span style={s.savingPill}>{saving}</span>}
          </button>
        </div>

        {/* Price display */}
        <div style={s.priceDisplay}>
          <span style={s.priceAmount}>
            {plan === 'annual' ? '$29.99' : '$4.99'}
          </span>
          <span style={s.pricePer}>
            {plan === 'annual' ? '/year' : '/month'}
          </span>
          {plan === 'annual' && (
            <span style={s.priceEquiv}>({monthlyEquiv}/mo)</span>
          )}
        </div>

        {/* Feature comparison */}
        <div style={s.compGrid}>
          <div style={s.compCard}>
            <p style={s.compLabel}>Free</p>
            <ul style={s.compList}>
              <li style={s.compItem}><span style={s.x}>✗</span>3 total + 1/day</li>
              <li style={s.compItem}><span style={s.x}>✗</span>No share cards</li>
              <li style={s.compItem}><span style={s.chk}>✓</span>Full AI analysis</li>
              <li style={s.compItem}><span style={s.chk}>✓</span>Reply suggestions</li>
            </ul>
          </div>
          <div style={{ ...s.compCard, ...s.compCardPro }}>
            <p style={{ ...s.compLabel, color: '#c084fc' }}>Pro</p>
            <ul style={s.compList}>
              <li style={s.compItem}><span style={s.chkPro}>✓</span>Unlimited decodes</li>
              <li style={s.compItem}><span style={s.chkPro}>✓</span>Shareable image cards</li>
              <li style={s.compItem}><span style={s.chkPro}>✓</span>Full AI analysis</li>
              <li style={s.compItem}><span style={s.chkPro}>✓</span>Reply suggestions</li>
            </ul>
          </div>
        </div>

        {error && <p style={s.error}>⚠️ {error}</p>}

        <button className="main-btn" style={s.upgradeBtn} onClick={handleUpgrade} disabled={loading}>
          {loading ? 'Redirecting...' : `Get Pro — ${plan === 'annual' ? '$29.99/yr' : '$4.99/mo'} 🔥`}
        </button>

        {dailyUsed && (
          <p style={s.waitNote}>Or wait until tomorrow for your next free decode.</p>
        )}

        <button style={s.closeBtn} className="ghost-btn" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </div>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal: { background: 'linear-gradient(160deg, #0f0820 0%, #120a28 100%)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '28px', padding: '32px 28px', maxWidth: '440px', width: '100%', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' },
  header: { textAlign: 'center' },
  icon: { fontSize: '2.6rem', marginBottom: '10px' },
  title: { fontSize: '1.35rem', fontWeight: '900', color: 'white', margin: '0 0 8px', lineHeight: '1.3' },
  sub: { color: 'rgba(255,255,255,0.42)', fontSize: '0.87rem', lineHeight: '1.6', margin: 0 },
  planToggle: { display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '4px', gap: '4px' },
  toggleBtn: { flex: 1, padding: '9px', background: 'none', border: 'none', borderRadius: '9px', color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
  toggleBtnActive: { background: 'rgba(168,85,247,0.2)', color: 'white' },
  savingPill: { background: 'linear-gradient(135deg, #ff6eb4, #a855f7)', color: 'white', fontSize: '0.65rem', fontWeight: '800', padding: '2px 7px', borderRadius: '999px' },
  priceDisplay: { textAlign: 'center', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' },
  priceAmount: { fontSize: '2.8rem', fontWeight: '900', color: 'white', lineHeight: '1' },
  pricePer: { fontSize: '1rem', color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
  priceEquiv: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginLeft: '4px' },
  compGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  compCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '14px' },
  compCardPro: { background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' },
  compLabel: { fontSize: '0.75rem', fontWeight: '800', color: 'rgba(255,255,255,0.35)', margin: '0 0 10px', letterSpacing: '0.04em' },
  compList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '7px' },
  compItem: { display: 'flex', gap: '7px', color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', alignItems: 'center' },
  x: { color: 'rgba(255,80,80,0.55)', fontWeight: '700', flexShrink: 0 },
  chk: { color: 'rgba(255,255,255,0.25)', fontWeight: '700', flexShrink: 0 },
  chkPro: { color: '#a855f7', fontWeight: '700', flexShrink: 0 },
  error: { color: '#ff8888', fontSize: '0.83rem', textAlign: 'center', margin: 0, background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: '10px', padding: '10px' },
  upgradeBtn: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #ff6eb4, #a855f7)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '1rem', fontWeight: '800', cursor: 'pointer' },
  waitNote: { color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem', textAlign: 'center', margin: 0 },
  closeBtn: { width: '100%', padding: '11px', background: 'none', border: 'none', borderRadius: '10px', color: 'rgba(255,255,255,0.22)', fontSize: '0.86rem', cursor: 'pointer' },
}
