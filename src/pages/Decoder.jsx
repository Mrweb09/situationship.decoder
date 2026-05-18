import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import UpgradeModal from '../components/UpgradeModal.jsx'
import { generateShareCard } from '../utils/shareCard.js'

const API = import.meta.env.VITE_API_URL || '/api'
const FREE_LIMIT = 3

const STATUS_COLORS = {
  'Ghosting Incoming': '#ff4444',
  'Breadcrumbing': '#ff8800',
  'Lowkey Interested': '#ffcc00',
  'Catching Feelings': '#44bbff',
  'Rizz Detected': '#44ff88',
}
const STATUS_EMOJI = {
  'Ghosting Incoming': '👻',
  'Breadcrumbing': '🍞',
  'Lowkey Interested': '👀',
  'Catching Feelings': '💕',
  'Rizz Detected': '🔥',
}
const STATUS_SUBTEXT = {
  'Ghosting Incoming': 'They\'re about to vanish',
  'Breadcrumbing': 'Keeping you on the hook',
  'Lowkey Interested': 'Playing it cool',
  'Catching Feelings': 'They\'re feeling it',
  'Rizz Detected': 'They\'re obsessed',
}
const RED_FLAGS = {
  'Ghosting Incoming': 4,
  'Breadcrumbing': 3,
  'Lowkey Interested': 1,
  'Catching Feelings': 0,
  'Rizz Detected': 0,
}
const EXAMPLE_CONVO = `You: hey you free this weekend?
Them: maybe why
You: thought we could hang out or something
Them: yeah possibly lmk closer to the time
You: ok cool, saturday work?
Them: idk i might have stuff on ill let you know
You: ok no worries
Them: [left on read for 3 days]
Them: hey sorry been so busy lately 😭
You: all good! so saturday still?
Them: ugh i can't this weekend maybe next week?
You: sure just let me know
Them: [seen]`

const LOADING_MSGS = [
  'Reading between the lines... 👀',
  'Analyzing the vibes... 🔮',
  'Consulting the situationship gods... 🙏',
  'Detecting red flags... 🚩',
  'The truth hurts but here it comes... 💀',
  'Running emotional damage assessment... 🫀',
]

function getDailyStatus(count, pro) {
  if (pro) return 'pro'
  if (count < FREE_LIMIT) return 'free'
  const last = localStorage.getItem('sdLastFreeDate')
  return last !== new Date().toDateString() ? 'daily_available' : 'daily_used'
}

export default function Decoder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [conversation, setConversation] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [msgIdx, setMsgIdx] = useState(0)
  const [decodeCount, setDecodeCount] = useState(0)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [confWidth, setConfWidth] = useState(0)
  const [copiedIdx, setCopiedIdx] = useState(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [generatingCard, setGeneratingCard] = useState(false)
  const [rated, setRated] = useState(null)
  const [viralBanner, setViralBanner] = useState(false)
  const [dailyStatus, setDailyStatus] = useState('free')

  const intervalRef = useRef(null)
  const toastTimer = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    const count = parseInt(localStorage.getItem('sdCount') || '0')
    const pro = localStorage.getItem('sdProUnlocked') === 'true'
    setDecodeCount(count)
    setIsPro(pro)
    setHistory(JSON.parse(localStorage.getItem('sdHistory') || '[]'))
    setDailyStatus(getDailyStatus(count, pro))

    if (searchParams.get('success') === 'true') {
      localStorage.setItem('sdProUnlocked', 'true')
      setIsPro(true)
      setDailyStatus('pro')
      showToast('🎉 Pro unlocked! Unlimited decodes enabled.')
      window.history.replaceState({}, '', '/decode')
    }
    if (searchParams.get('viral') === 'true') {
      setViralBanner(true)
      window.history.replaceState({}, '', '/decode')
      setTimeout(() => setViralBanner(false), 6000)
    }
  }, [searchParams])

  useEffect(() => {
    if (loading) {
      intervalRef.current = setInterval(() => setMsgIdx(i => (i + 1) % LOADING_MSGS.length), 1600)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [loading])

  useEffect(() => {
    if (result) {
      setConfWidth(0)
      const t = setTimeout(() => setConfWidth(result.confidence), 80)
      return () => clearTimeout(t)
    }
  }, [result])

  const showToast = (msg) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    setToastVisible(true)
    toastTimer.current = setTimeout(() => setToastVisible(false), 2400)
  }

  const analyse = async () => {
    if (!conversation.trim()) { showToast('Paste a conversation first 👆'); return }
    if (dailyStatus === 'daily_used') { setShowUpgrade(true); return }

    setLoading(true)
    setResult(null)
    setError(null)
    setRated(null)
    setMsgIdx(0)

    try {
      const res = await fetch(`${API}/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || `Error ${res.status}`) }
      const data = await res.json()
      if (!data.verdict || !data.status) throw new Error('Unexpected response from server')
      setResult(data)

      const newCount = decodeCount + 1
      setDecodeCount(newCount)
      localStorage.setItem('sdCount', newCount)

      // If using daily decode, mark today as used
      if (newCount > FREE_LIMIT && !isPro) {
        localStorage.setItem('sdLastFreeDate', new Date().toDateString())
        setDailyStatus('daily_used')
      } else {
        setDailyStatus(getDailyStatus(newCount, isPro))
      }

      const entry = { status: data.status, verdict: data.verdict, confidence: data.confidence, ts: Date.now() }
      const newHist = [entry, ...history].slice(0, 6)
      setHistory(newHist)
      localStorage.setItem('sdHistory', JSON.stringify(newHist))
    } catch (err) {
      console.error(err)
      setError(err.message.includes('fetch') ? 'Something went wrong. Please try again.' : err.message)
    }
    setLoading(false)
  }

  const handleRate = async (accurate) => {
    setRated(accurate)
    showToast(accurate ? 'Thanks! Glad we got it right 🎯' : 'Thanks for the feedback — we\'ll improve 🙏')
    try {
      await fetch(`${API}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accurate }),
      })
    } catch {}
  }

  const copyReply = (reply, idx) => {
    navigator.clipboard.writeText(reply)
    setCopiedIdx(idx)
    showToast('Copied! Send it 😈')
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const shareText = () => {
    if (!result) return
    const flags = '🚩'.repeat(RED_FLAGS[result.status] || 0)
    navigator.clipboard.writeText([
      '💀 Situationship Decoder',
      '',
      `${STATUS_EMOJI[result.status]} ${result.status}`,
      `Interest Level: ${result.confidence}%${flags ? `  ${flags}` : ''}`,
      '',
      `"${result.verdict}"`,
      '',
      result.explanation,
      '',
      'situationship-decoder.app',
    ].join('\n'))
    showToast('Results copied — go spill 🔥')
  }

  const sendToThem = () => {
    const url = `${window.location.origin}/decode?viral=true`
    navigator.clipboard.writeText(`Someone thinks you need to be decoded 💀\n\nFind out where you actually stand:\n${url}`)
    showToast('Link copied — send it to them 💀')
  }

  const downloadCard = async () => {
    if (!result) return
    if (!isPro) { setShowUpgrade(true); return }
    setGeneratingCard(true)
    try {
      const dataUrl = await generateShareCard(result)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `situationship-${result.status.toLowerCase().replace(/ /g, '-')}.png`
      a.click()
      showToast('Card downloaded! Share it everywhere 📸')
    } catch (err) {
      showToast('Could not generate card')
      console.error(err)
    }
    setGeneratingCard(false)
  }

  const reset = () => {
    setResult(null)
    setConversation('')
    setError(null)
    setConfWidth(0)
    setRated(null)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  const color = result ? (STATUS_COLORS[result.status] || '#888') : '#a855f7'
  const flagCount = result ? (RED_FLAGS[result.status] || 0) : 0
  const freeRemaining = Math.max(0, FREE_LIMIT - decodeCount)

  return (
    <div style={s.page}>
      {showUpgrade && (
        <UpgradeModal
          dailyUsed={dailyStatus === 'daily_used'}
          onClose={() => setShowUpgrade(false)}
          onUnlock={() => { setIsPro(true); setDailyStatus('pro'); setShowUpgrade(false) }}
        />
      )}

      {/* Toast */}
      <div style={{ ...s.toast, opacity: toastVisible ? 1 : 0, transform: toastVisible ? 'translateY(0) translateX(-50%)' : 'translateY(-14px) translateX(-50%)' }}>
        {toast}
      </div>

      {/* Viral banner */}
      {viralBanner && (
        <div style={s.viralBanner} className="card-in">
          👀 Someone thinks you need to be decoded... let's find out
        </div>
      )}

      {/* Nav */}
      <nav style={s.nav}>
        <button style={s.backBtn} className="ghost-btn" onClick={() => navigate('/')}>← Back</button>
        <span style={s.navLogo}>💀 Situationship Decoder</span>
        <div style={s.navRight}>
          {dailyStatus === 'pro' && <span style={s.proBadge}>✦ Pro</span>}
          {dailyStatus === 'free' && <span style={s.freeBadge}>{freeRemaining} free left</span>}
          {dailyStatus === 'daily_available' && <span style={s.dailyBadge}>Free decode ✓</span>}
          {dailyStatus === 'daily_used' && <span style={s.usedBadge}>Back tomorrow</span>}
        </div>
      </nav>

      <div style={s.wrap}>
        <div style={s.card} className="card-in">
          {/* Header */}
          <div style={s.header}>
            <h1 style={s.title}>💀 Situationship Decoder</h1>
            <p style={s.subtitle}>Find out where you actually stand</p>
            {history.length > 0 && (
              <button style={s.historyBtn} className="ghost-btn" onClick={() => setShowHistory(v => !v)}>
                {showHistory ? '▲ Hide history' : `▼ History (${history.length})`}
              </button>
            )}
          </div>

          {/* History */}
          {showHistory && (
            <div style={s.historyPanel}>
              {history.map((h, i) => (
                <div key={i} style={{ ...s.historyItem, borderLeft: `3px solid ${STATUS_COLORS[h.status] || '#888'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ ...s.historyStatus, color: STATUS_COLORS[h.status] || '#888' }}>{STATUS_EMOJI[h.status]} {h.status}</span>
                    <span style={s.historyMeta}>{h.confidence}%</span>
                  </div>
                  <p style={s.historyVerdict}>"{h.verdict}"</p>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          {!result && !loading && (
            <div style={s.inputSection}>
              <div style={s.textareaWrap}>
                <textarea
                  ref={textareaRef}
                  style={s.textarea}
                  className="sd-textarea"
                  placeholder={`Paste your texts here...\n\nTip: include both sides of the convo for the most accurate read.\n\nExample:\nYou: hey stranger 👋\nThem: [delivered]\nYou: hello??\nThem: omg sorry was busy!!`}
                  value={conversation}
                  onChange={e => setConversation(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) analyse() }}
                />
                {conversation.length > 0 && <span style={s.charCount}>{conversation.length} chars</span>}
              </div>
              {conversation.length === 0 && (
                <button style={s.exampleBtn} onClick={() => setConversation(EXAMPLE_CONVO)}>
                  ✨ Try an example conversation
                </button>
              )}
              {error && <div style={s.errorBox}><span>⚠️</span><span>{error}</span></div>}
              <button className="main-btn" style={s.mainBtn} onClick={analyse}>
                Decode My Situation 💀
              </button>
              {dailyStatus === 'daily_available' && (
                <p style={s.dailyNote}>✓ Your daily free decode is available</p>
              )}
              {dailyStatus === 'free' && freeRemaining > 0 && (
                <p style={s.freeNote}>{freeRemaining} free decode{freeRemaining !== 1 ? 's' : ''} remaining · <button style={s.upgradeInline} onClick={() => setShowUpgrade(true)}>Upgrade to Pro</button></p>
              )}
              <p style={s.hint}>⌘ + Enter to decode</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={s.loadingSection}>
              <div className="spinner" />
              <p style={s.loadingText} key={msgIdx} className="msg-fade">{LOADING_MSGS[msgIdx]}</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div style={s.results} className="results-in">

              {/* Status badge */}
              <div style={{ ...s.statusBadge, background: color + '18', border: `1px solid ${color}55`, color, boxShadow: `0 0 28px ${color}1a` }}>
                <span style={s.statusIcon}>{STATUS_EMOJI[result.status]}</span>
                <div>
                  <div style={s.statusName}>{result.status}</div>
                  <div style={s.statusSub}>{STATUS_SUBTEXT[result.status]}</div>
                </div>
              </div>

              {/* Red flags */}
              {flagCount > 0 && (
                <div style={s.flagRow}>
                  <span style={s.flags}>{'🚩'.repeat(flagCount)}</span>
                  <span style={s.flagLabel}>{flagCount} red flag{flagCount !== 1 ? 's' : ''} detected</span>
                </div>
              )}

              {/* Verdict */}
              <div style={s.verdictBox}>
                <p style={s.verdictLabel}>THE VERDICT</p>
                <h2 style={s.verdict}>"{result.verdict}"</h2>
              </div>

              {/* Confidence */}
              <div style={s.confSection}>
                <div style={s.confHeader}>
                  <span style={s.confLabel}>Interest Level</span>
                  <span style={{ ...s.confNum, color }}>{result.confidence}%</span>
                </div>
                <div style={s.track}>
                  <div style={{ ...s.fill, width: `${confWidth}%`, background: `linear-gradient(90deg, ${color}66, ${color})`, transition: 'width 1.3s cubic-bezier(0.22, 1, 0.36, 1)', boxShadow: `0 0 10px ${color}44` }} />
                </div>
              </div>

              {/* Explanation */}
              <p style={s.explanation}>{result.explanation}</p>

              {/* What They're Actually Saying */}
              {Array.isArray(result.translations) && result.translations.length > 0 && (
                <div style={s.translationsSection}>
                  <p style={s.translationsHeading}>🔍 What They're Actually Saying</p>
                  {result.translations.map((t, i) => (
                    <div key={i} style={s.translationItem}>
                      <p style={s.translationSaid}>"{t.said}"</p>
                      <p style={s.translationActually}>→ {t.actually}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Replies */}
              <div style={s.repliesSection}>
                <p style={s.repliesHeading}>🔥 How to Reply</p>
                {Array.isArray(result.replies) && result.replies.map((reply, i) => (
                  <div
                    key={i}
                    className="reply-card"
                    style={{ ...s.replyCard, ...(copiedIdx === i ? s.replyCardCopied : {}) }}
                    onClick={() => copyReply(reply, i)}
                  >
                    <div style={s.replyCardTop}>
                      <span style={s.replyTag}>{i === 0 ? '😇 Safe' : i === 1 ? '😏 Bold' : '💀 Unhinged'}</span>
                      <span style={s.copyHint}>{copiedIdx === i ? '✓ Copied!' : 'tap to copy'}</span>
                    </div>
                    <p style={s.replyText}>{reply}</p>
                  </div>
                ))}
              </div>

              {/* Accuracy rating */}
              {rated === null ? (
                <div style={s.ratingRow}>
                  <span style={s.ratingLabel}>Was this accurate?</span>
                  <button style={s.ratingBtn} onClick={() => handleRate(true)}>👍</button>
                  <button style={s.ratingBtn} onClick={() => handleRate(false)}>👎</button>
                </div>
              ) : (
                <p style={s.ratedMsg}>{rated ? '🎯 Glad we nailed it' : '🙏 Thanks — we\'ll do better'}</p>
              )}

              {/* Action row */}
              <div style={s.actionRow}>
                <button style={s.actionBtn} className="ghost-btn" onClick={shareText}>Share 📤</button>
                <button style={s.actionBtn} className="ghost-btn" onClick={sendToThem}>Send to them 💀</button>
                <button
                  style={{ ...s.actionBtn, ...(isPro ? s.actionBtnPro : s.actionBtnLocked) }}
                  className="ghost-btn"
                  onClick={downloadCard}
                  disabled={generatingCard}
                >
                  {generatingCard ? '...' : isPro ? '📸 Card' : '🔒 Card'}
                </button>
              </div>

              {!isPro && (
                <p style={s.proNudge}>
                  <button style={s.upgradeInline} onClick={() => setShowUpgrade(true)}>Upgrade to Pro</button>
                  {' '}to download a shareable image card for Instagram & TikTok
                </p>
              )}

              {/* Daily decode nudge */}
              {dailyStatus === 'daily_used' && !isPro && (
                <div style={s.dailyUsedBox}>
                  <p style={s.dailyUsedText}>You've used today's free decode. Come back tomorrow for another free one, or <button style={s.upgradeInline} onClick={() => setShowUpgrade(true)}>upgrade to Pro</button> for unlimited.</p>
                </div>
              )}

              <button className="main-btn" style={s.resetBtn} onClick={reset}>Decode Another 🔄</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(160deg, #06060f 0%, #130a24 55%, #060614 100%)', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" },
  viralBanner: {
    background: 'linear-gradient(135deg, rgba(255,110,180,0.15), rgba(168,85,247,0.15))',
    border: '1px solid rgba(168,85,247,0.25)',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    padding: '12px 20px',
    fontSize: '0.92rem',
    fontWeight: '600',
  },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', background: 'rgba(6,6,15,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100 },
  backBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px', minWidth: '60px' },
  navLogo: { fontWeight: '800', fontSize: '0.9rem', background: 'linear-gradient(135deg, #ff6eb4, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' },
  navRight: { minWidth: '60px', display: 'flex', justifyContent: 'flex-end' },
  proBadge: { background: 'linear-gradient(135deg, #ff6eb4, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '0.82rem', fontWeight: '800' },
  freeBadge: { color: 'rgba(255,255,255,0.28)', fontSize: '0.75rem', fontWeight: '600' },
  dailyBadge: { color: '#44ff88', fontSize: '0.75rem', fontWeight: '700' },
  usedBadge: { color: 'rgba(255,255,255,0.22)', fontSize: '0.72rem', fontWeight: '600' },
  wrap: { display: 'flex', justifyContent: 'center', padding: '28px 16px 60px' },
  card: { background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px', padding: '32px 28px', maxWidth: '560px', width: '100%' },
  toast: { position: 'fixed', top: '70px', left: '50%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '10px 20px', borderRadius: '999px', fontSize: '0.88rem', fontWeight: '600', zIndex: 1000, pointerEvents: 'none', transition: 'opacity 0.25s ease, transform 0.25s ease', whiteSpace: 'nowrap' },
  header: { textAlign: 'center', marginBottom: '24px' },
  title: { fontSize: 'clamp(1.7rem, 5vw, 2.2rem)', fontWeight: '900', background: 'linear-gradient(135deg, #ff6eb4 0%, #c084fc 50%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 6px' },
  subtitle: { color: 'rgba(255,255,255,0.3)', margin: '0 0 8px', fontSize: '0.9rem' },
  historyBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', fontSize: '0.76rem', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' },
  historyPanel: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', padding: '12px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' },
  historyItem: { padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.025)', paddingLeft: '14px' },
  historyStatus: { fontSize: '0.78rem', fontWeight: '700' },
  historyMeta: { fontSize: '0.73rem', color: 'rgba(255,255,255,0.28)' },
  historyVerdict: { color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', margin: '4px 0 0', lineHeight: '1.4', fontStyle: 'italic' },
  inputSection: { display: 'flex', flexDirection: 'column', gap: '10px' },
  textareaWrap: { position: 'relative' },
  textarea: { width: '100%', minHeight: '190px', background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', color: 'white', fontSize: '0.93rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: '1.65', fontFamily: 'inherit' },
  charCount: { position: 'absolute', bottom: '10px', right: '14px', fontSize: '0.68rem', color: 'rgba(255,255,255,0.18)', pointerEvents: 'none' },
  errorBox: { display: 'flex', gap: '8px', background: 'rgba(255,68,68,0.09)', border: '1px solid rgba(255,68,68,0.22)', borderRadius: '10px', padding: '10px 14px', color: '#ff8888', fontSize: '0.86rem', lineHeight: '1.5', alignItems: 'flex-start' },
  mainBtn: { width: '100%', padding: '17px', background: 'linear-gradient(135deg, #ff6eb4, #a855f7)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '1.05rem', fontWeight: '800', cursor: 'pointer' },
  dailyNote: { color: '#44ff88', fontSize: '0.78rem', textAlign: 'center', margin: 0, fontWeight: '600' },
  freeNote: { color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem', textAlign: 'center', margin: 0 },
  upgradeInline: { background: 'none', border: 'none', color: '#c084fc', fontSize: 'inherit', fontWeight: '700', cursor: 'pointer', padding: 0, textDecoration: 'underline', textDecorationColor: 'rgba(192,132,252,0.4)' },
  exampleBtn: { background: 'rgba(168,85,247,0.08)', border: '1px dashed rgba(168,85,247,0.3)', borderRadius: '10px', color: 'rgba(192,132,252,0.8)', fontSize: '0.82rem', fontWeight: '600', padding: '10px', cursor: 'pointer', textAlign: 'center', width: '100%' },
  hint: { color: 'rgba(255,255,255,0.15)', fontSize: '0.7rem', textAlign: 'center', margin: 0 },
  loadingSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', padding: '48px 0' },
  loadingText: { color: 'rgba(255,255,255,0.42)', fontSize: '0.95rem', margin: 0, textAlign: 'center' },
  results: { display: 'flex', flexDirection: 'column', gap: '16px' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderRadius: '16px' },
  statusIcon: { fontSize: '2rem', lineHeight: '1' },
  statusName: { fontSize: '1rem', fontWeight: '800', letterSpacing: '0.02em' },
  statusSub: { fontSize: '0.77rem', opacity: '0.6', marginTop: '2px' },
  flagRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.14)', borderRadius: '10px' },
  flags: { fontSize: '1rem', letterSpacing: '2px' },
  flagLabel: { color: 'rgba(255,120,120,0.75)', fontSize: '0.8rem', fontWeight: '600' },
  verdictBox: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '18px 20px' },
  verdictLabel: { color: 'rgba(255,255,255,0.22)', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' },
  verdict: { color: 'white', fontSize: '1.18rem', fontWeight: '700', margin: 0, lineHeight: '1.5' },
  confSection: { display: 'flex', flexDirection: 'column', gap: '10px' },
  confHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  confLabel: { color: 'rgba(255,255,255,0.42)', fontSize: '0.84rem' },
  confNum: { fontWeight: '800', fontSize: '1.05rem' },
  track: { height: '10px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: '999px' },
  explanation: { color: 'rgba(255,255,255,0.6)', lineHeight: '1.75', margin: 0, fontSize: '0.94rem' },
  translationsSection: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' },
  translationsHeading: { color: 'white', fontWeight: '800', margin: '0 0 4px', fontSize: '0.95rem' },
  translationItem: { display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', lastChild: { borderBottom: 'none' } },
  translationSaid: { color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' },
  translationActually: { color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', margin: 0, fontWeight: '500' },
  repliesSection: { display: 'flex', flexDirection: 'column', gap: '8px' },
  repliesHeading: { color: 'white', fontWeight: '800', margin: '0 0 2px', fontSize: '0.95rem' },
  replyCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '12px 16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px' },
  replyCardCopied: { background: 'rgba(68,255,136,0.07)', border: '1px solid rgba(68,255,136,0.18)' },
  replyCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  replyTag: { fontSize: '0.72rem', color: 'rgba(255,255,255,0.32)', fontWeight: '700' },
  copyHint: { fontSize: '0.67rem', color: 'rgba(255,255,255,0.2)' },
  replyText: { color: 'white', margin: 0, fontSize: '0.92rem', lineHeight: '1.55' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', padding: '6px 0' },
  ratingLabel: { color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem' },
  ratingBtn: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 14px', fontSize: '1.1rem', cursor: 'pointer', transition: 'background 0.15s' },
  ratedMsg: { color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', textAlign: 'center', margin: 0 },
  actionRow: { display: 'flex', gap: '8px' },
  actionBtn: { flex: 1, padding: '12px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '12px', color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', textAlign: 'center' },
  actionBtnPro: { background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' },
  actionBtnLocked: { color: 'rgba(255,255,255,0.25)' },
  proNudge: { color: 'rgba(255,255,255,0.25)', fontSize: '0.76rem', textAlign: 'center', margin: 0, lineHeight: '1.5' },
  dailyUsedBox: { background: 'rgba(255,200,100,0.06)', border: '1px solid rgba(255,200,100,0.14)', borderRadius: '12px', padding: '12px 16px' },
  dailyUsedText: { color: 'rgba(255,200,100,0.7)', fontSize: '0.82rem', margin: 0, lineHeight: '1.6', textAlign: 'center' },
  resetBtn: { width: '100%', padding: '15px', background: 'linear-gradient(135deg, #ff6eb4, #a855f7)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '0.98rem', fontWeight: '800', cursor: 'pointer' },
}
