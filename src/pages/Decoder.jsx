import { useState, useEffect, useRef, useCallback } from 'react'
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
  'Benching': '#ff6b35',
  'Love Bombing': '#ff3399',
  'Zombie Mode': '#b06aff',
}
const STATUS_EMOJI = {
  'Ghosting Incoming': '👻',
  'Breadcrumbing': '🍞',
  'Lowkey Interested': '👀',
  'Catching Feelings': '💕',
  'Rizz Detected': '🔥',
  'Benching': '🪑',
  'Love Bombing': '💣',
  'Zombie Mode': '🧟',
}
const STATUS_SUBTEXT = {
  'Ghosting Incoming': 'They\'re about to vanish',
  'Breadcrumbing': 'Keeping you on the hook',
  'Lowkey Interested': 'Playing it cool',
  'Catching Feelings': 'They\'re feeling it',
  'Rizz Detected': 'They\'re obsessed',
  'Benching': 'You\'re the backup plan',
  'Love Bombing': 'Too much, too fast',
  'Zombie Mode': 'Back from the dead',
}
const RED_FLAGS = {
  'Ghosting Incoming': 4,
  'Breadcrumbing': 3,
  'Lowkey Interested': 1,
  'Catching Feelings': 0,
  'Rizz Detected': 0,
  'Benching': 3,
  'Love Bombing': 2,
  'Zombie Mode': 3,
}
const STATUS_POINTS = {
  'Ghosting Incoming': -10,
  'Breadcrumbing': -5,
  'Benching': -5,
  'Zombie Mode': -3,
  'Love Bombing': -3,
  'Lowkey Interested': 5,
  'Catching Feelings': 15,
  'Rizz Detected': 20,
}
function getScoreLabel(score) {
  if (score <= -30) return { label: 'Certified Situationship Victim', color: '#ff4444' }
  if (score <= -10) return { label: 'Living in the grey area', color: '#ff8800' }
  if (score <= 0)   return { label: 'It\'s complicated', color: '#ffcc00' }
  if (score <= 20)  return { label: 'Actually doing ok', color: '#44bbff' }
  return { label: 'Thriving era', color: '#44ff88' }
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

const PERSONALITY_TYPES = [
  { id: 'magnet', label: 'Unavailable People Magnet', desc: 'You keep attracting people who won\'t commit. You deserve consistency — stop settling for crumbs.', color: '#ff4444', emoji: '🧲', condition: h => h.filter(x => ['Ghosting Incoming','Breadcrumbing','Benching'].includes(x.status)).length >= h.length * 0.6 },
  { id: 'overthinker', label: 'Chronic Overthinker', desc: 'You analyse every message twice. The decoder was literally made for you. Trust your gut more.', color: '#ff8800', emoji: '🌀', condition: h => h.length >= 4 },
  { id: 'hopeful', label: 'Hopeless Romantic', desc: 'You see the best in people even when the signs say otherwise. Sweet, but set some standards.', color: '#44bbff', emoji: '💫', condition: h => h.filter(x => ['Catching Feelings','Lowkey Interested'].includes(x.status)).length >= 2 },
  { id: 'thriving', label: 'In Your Thriving Era', desc: 'Your situationships are actually going well. Either you\'ve levelled up or you\'re choosing better people.', color: '#44ff88', emoji: '✨', condition: h => h.filter(x => ['Rizz Detected','Catching Feelings'].includes(x.status)).length >= h.length * 0.5 },
]

function getPersonality(history) {
  if (history.length < 3) return null
  return PERSONALITY_TYPES.find(p => p.condition(history)) || PERSONALITY_TYPES[1]
}

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
  const [situationshipScore, setSituationshipScore] = useState(0)
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
  const [emailInput, setEmailInput] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [followUpInput, setFollowUpInput] = useState('')
  const [followUpAnswer, setFollowUpAnswer] = useState(null)
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const [followUpCount, setFollowUpCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showDailyCheckin, setShowDailyCheckin] = useState(false)
  const [imageData, setImageData] = useState(null)
  const [imageType, setImageType] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

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
    setSituationshipScore(parseInt(localStorage.getItem('sdScore') || '0'))
    setStreak(parseInt(localStorage.getItem('sdStreak') || '0'))

    const checkinDone = localStorage.getItem('sdCheckinDate') === new Date().toDateString()
    const hasDecoded = parseInt(localStorage.getItem('sdCount') || '0') > 0
    if (!checkinDone && hasDecoded) setShowDailyCheckin(true)

    if (searchParams.get('success') === 'true') {
      localStorage.setItem('sdProUnlocked', 'true')
      setIsPro(true)
      setDailyStatus('pro')
      showToast('🎉 Pro unlocked! Unlimited decodes enabled.')
      window.history.replaceState({}, '', '/decode')
    }
    if (searchParams.get('viral') === 'true' || searchParams.get('friend') === 'true') {
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

  const handleImageFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 1568
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX }
          else { width = Math.round(width * MAX / height); height = MAX }
        }
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        const compressed = canvas.toDataURL('image/jpeg', 0.85)
        setImageData(compressed.split(',')[1])
        setImageType('image/jpeg')
        setConversation('')
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }, [])

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        handleImageFile(item.getAsFile())
        return
      }
    }
  }, [handleImageFile])

  useEffect(() => {
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  const analyse = async () => {
    if (!conversation.trim() && !imageData) { showToast('Paste a conversation or upload a screenshot 👆'); return }
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
        body: JSON.stringify(imageData ? { imageData, imageType } : { conversation }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || `Error ${res.status}`) }
      const data = await res.json()
      if (!data.verdict || !data.status) throw new Error('Unexpected response from server')
      setResult(data)

      const newCount = decodeCount + 1
      setDecodeCount(newCount)
      localStorage.setItem('sdCount', newCount)

      const points = STATUS_POINTS[data.status] || 0
      const newScore = situationshipScore + points
      setSituationshipScore(newScore)
      localStorage.setItem('sdScore', newScore)

      const today = new Date().toDateString()
      const lastDecodeDay = localStorage.getItem('sdLastDecodeDay')
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      const newStreak = lastDecodeDay === today ? streak : lastDecodeDay === yesterday ? streak + 1 : 1
      setStreak(newStreak)
      localStorage.setItem('sdStreak', newStreak)
      localStorage.setItem('sdLastDecodeDay', today)

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
    const { label } = getScoreLabel(situationshipScore)
    const p = getPersonality(history)
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
      `My score: ${situationshipScore > 0 ? '+' : ''}${situationshipScore} · ${label}`,
      p ? `My type: ${p.emoji} ${p.label}` : '',
      '',
      'situationship-decoder.com',
    ].filter(Boolean).join('\n'))
    showToast('Results copied — go spill 🔥')
  }

  const sendToFriend = () => {
    const url = `${window.location.origin}/decode?friend=true`
    navigator.clipboard.writeText(`my situationship score is ${situationshipScore > 0 ? '+' : ''}${situationshipScore} 💀 what's yours?\n\n${url}`)
    showToast('Link copied — send it to your friends 💀')
  }

  const sendToThem = () => {
    const url = `${window.location.origin}/decode?viral=true`
    navigator.clipboard.writeText(`Someone thinks you need to be decoded 💀\n\nFind out where you actually stand:\n${url}`)
    showToast('Link copied — send it to them 💀')
  }

  const downloadCard = async () => {
    if (!result) return
    setGeneratingCard(true)
    try {
      const p = getPersonality(history)
      const dataUrl = await generateShareCard(result, situationshipScore, p)
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

  const submitEmail = async () => {
    if (!emailInput.includes('@')) return
    try {
      await fetch(`${API}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput }),
      })
    } catch {}
    setEmailSubmitted(true)
    showToast('You\'re on the list 🎉')
  }

  const askFollowUp = async () => {
    if (!followUpInput.trim() || !result) return
    if (!isPro && followUpCount >= 1) { setShowUpgrade(true); return }
    setFollowUpLoading(true)
    try {
      const res = await fetch(`${API}/followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: followUpInput,
          context: { ...result, conversation },
        }),
      })
      const data = await res.json()
      if (data.answer) {
        setFollowUpAnswer(data.answer)
        setFollowUpCount(c => c + 1)
        setFollowUpInput('')
      }
    } catch {}
    setFollowUpLoading(false)
  }

  const reset = () => {
    setResult(null)
    setConversation('')
    setError(null)
    setConfWidth(0)
    setRated(null)
    setEmailInput('')
    setEmailSubmitted(false)
    setFollowUpInput('')
    setFollowUpAnswer(null)
    setFollowUpCount(0)
    setImageData(null)
    setImageType(null)
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

      {/* Daily check-in */}
      {showDailyCheckin && (
        <div style={s.checkinBar}>
          <span style={s.checkinText}>Daily check-in: how's the situation today?</span>
          <div style={s.checkinBtns}>
            {['😭 Worse','😐 Same','🙂 Better','🔥 Amazing'].map((mood, i) => (
              <button key={i} style={s.checkinBtn} onClick={() => {
                localStorage.setItem('sdCheckinDate', new Date().toDateString())
                setShowDailyCheckin(false)
                showToast(`Noted — keep going 💪`)
              }}>{mood}</button>
            ))}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={s.nav}>
        <button style={s.backBtn} className="ghost-btn" onClick={() => navigate('/')}>← Back</button>
        <span style={s.navLogo}>💀 Situationship Decoder</span>
        <div style={s.navRight}>
          {streak >= 2 && <span style={s.streakBadge}>🔥 {streak} day streak</span>}
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
            {decodeCount > 0 && (() => {
              const { label, color } = getScoreLabel(situationshipScore)
              return (
                <div style={{ ...s.scoreBadge, borderColor: color + '44', background: color + '12' }}>
                  <span style={{ ...s.scoreNum, color }}>{situationshipScore > 0 ? '+' : ''}{situationshipScore}</span>
                  <span style={{ ...s.scoreLabel, color }}>{label}</span>
                </div>
              )
            })()}
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
              {!imageData && conversation.length === 0 && (
                <button style={s.exampleBtn} onClick={() => setConversation(EXAMPLE_CONVO)}>
                  ✨ Try an example conversation
                </button>
              )}

              {/* Image upload */}
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageFile(e.target.files[0])} />
              {!imageData ? (
                <div
                  style={{ ...s.imageUpload, ...(dragOver ? s.imageUploadOver : {}) }}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleImageFile(e.dataTransfer.files[0]) }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span style={s.imageUploadIcon}>📸</span>
                  <span style={s.imageUploadText}>Upload a screenshot instead</span>
                  <span style={s.imageUploadHint}>drag, click or Ctrl+V</span>
                </div>
              ) : (
                <div style={s.imagePreviewWrap}>
                  <img src={`data:${imageType};base64,${imageData}`} style={s.imagePreview} alt="conversation screenshot" />
                  <button style={s.removeImg} onClick={() => { setImageData(null); setImageType(null) }}>✕ Remove</button>
                </div>
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

              {/* Score change */}
              {(() => {
                const pts = STATUS_POINTS[result.status] || 0
                const { label, color } = getScoreLabel(situationshipScore)
                return (
                  <div style={{ ...s.scoreChangeRow, color: pts >= 0 ? '#44ff88' : '#ff6666' }}>
                    <span style={s.scoreChangePts}>{pts >= 0 ? `+${pts}` : pts} points</span>
                    <span style={s.scoreChangeTotal}>Your score: <span style={{ color }}>{situationshipScore > 0 ? '+' : ''}{situationshipScore} · {label}</span></span>
                  </div>
                )
              })()}

              {/* Better or worse tracker */}
              {history.length >= 2 && (() => {
                const prev = history[1]
                const diff = result.confidence - prev.confidence
                if (Math.abs(diff) < 5) return null
                return (
                  <div style={{ ...s.trendBox, borderColor: diff > 0 ? '#44ff8844' : '#ff444444', background: diff > 0 ? 'rgba(68,255,136,0.05)' : 'rgba(255,68,68,0.05)' }}>
                    <span style={{ fontSize: '1.2rem' }}>{diff > 0 ? '📈' : '📉'}</span>
                    <span style={{ color: diff > 0 ? '#44ff88' : '#ff6666', fontSize: '0.85rem', fontWeight: '700' }}>
                      {diff > 0 ? `Up ${diff}% from last time — things are improving` : `Down ${Math.abs(diff)}% from last time — it's getting worse`}
                    </span>
                  </div>
                )
              })()}

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
                  style={{ ...s.actionBtn, ...s.actionBtnPro }}
                  className="ghost-btn"
                  onClick={downloadCard}
                  disabled={generatingCard}
                >
                  {generatingCard ? '...' : '📸 Card'}
                </button>
              </div>

              <p style={s.proNudge}>Download your card and share it to Instagram stories or TikTok 📸</p>

              {/* Daily decode nudge */}
              {dailyStatus === 'daily_used' && !isPro && (
                <div style={s.dailyUsedBox}>
                  <p style={s.dailyUsedText}>You've used today's free decode. Come back tomorrow for another free one, or <button style={s.upgradeInline} onClick={() => setShowUpgrade(true)}>upgrade to Pro</button> for unlimited.</p>
                </div>
              )}

              {/* Email capture */}
              {!emailSubmitted ? (
                <div style={s.emailBox}>
                  <p style={s.emailLabel}>📩 Get future decodes + updates</p>
                  <div style={s.emailRow}>
                    <input
                      style={s.emailInput}
                      type="email"
                      placeholder="your@email.com"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && submitEmail()}
                    />
                    <button style={s.emailBtn} onClick={submitEmail}>→</button>
                  </div>
                </div>
              ) : (
                <p style={s.emailDone}>✓ You're on the list — we'll keep you posted</p>
              )}

              {/* Follow-up questions */}
              <div style={s.followUpBox}>
                <p style={s.followUpHeading}>💬 Got a question about this?</p>
                {followUpAnswer && (
                  <div style={s.followUpAnswer}>
                    <p style={s.followUpAnswerText}>{followUpAnswer}</p>
                  </div>
                )}
                <div style={s.followUpRow}>
                  <input
                    style={s.followUpInput}
                    type="text"
                    placeholder={!isPro && followUpCount >= 1 ? 'Upgrade to Pro for more questions' : 'Should I text first? Is this worth it?'}
                    value={followUpInput}
                    onChange={e => setFollowUpInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && askFollowUp()}
                    disabled={!isPro && followUpCount >= 1}
                  />
                  <button
                    style={{ ...s.followUpBtn, opacity: followUpLoading ? 0.5 : 1 }}
                    onClick={askFollowUp}
                    disabled={followUpLoading || (!isPro && followUpCount >= 1)}
                  >
                    {followUpLoading ? '...' : '→'}
                  </button>
                </div>
                {!isPro && followUpCount === 0 && (
                  <p style={s.followUpHint}>1 free question · <button style={s.upgradeInline} onClick={() => setShowUpgrade(true)}>Upgrade</button> for unlimited</p>
                )}
                {!isPro && followUpCount >= 1 && (
                  <p style={s.followUpHint}><button style={s.upgradeInline} onClick={() => setShowUpgrade(true)}>Upgrade to Pro</button> for unlimited follow-up questions</p>
                )}
              </div>

              {/* Personality type */}
              {(() => {
                const p = getPersonality(history)
                if (!p) return null
                return (
                  <div style={{ ...s.personalityBox, borderColor: p.color + '44', background: p.color + '0d' }}>
                    <p style={s.personalityEyebrow}>YOUR DATING PERSONALITY</p>
                    <p style={{ ...s.personalityTitle, color: p.color }}>{p.emoji} {p.label}</p>
                    <p style={s.personalityDesc}>{p.desc}</p>
                  </div>
                )
              })()}

              {/* Friend challenge */}
              <button style={s.friendBtn} className="ghost-btn" onClick={sendToFriend}>
                💀 Challenge a friend — what's their score?
              </button>

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
  imageUpload: { border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.15s' },
  imageUploadOver: { border: '1px dashed rgba(168,85,247,0.5)', background: 'rgba(168,85,247,0.06)' },
  imageUploadIcon: { fontSize: '1.2rem' },
  imageUploadText: { color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', fontWeight: '600' },
  imageUploadHint: { color: 'rgba(255,255,255,0.18)', fontSize: '0.72rem', marginLeft: 'auto' },
  imagePreviewWrap: { position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' },
  imagePreview: { width: '100%', display: 'block', maxHeight: '280px', objectFit: 'cover', objectPosition: 'top' },
  removeImg: { position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.75rem', fontWeight: '700', padding: '5px 10px', cursor: 'pointer' },
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
  emailBox: { background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.18)', borderRadius: '14px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  emailLabel: { color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', fontWeight: '600', margin: 0 },
  emailRow: { display: 'flex', gap: '8px' },
  emailInput: { flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', color: 'white', fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit' },
  emailBtn: { background: 'linear-gradient(135deg, #ff6eb4, #a855f7)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '800', fontSize: '1.1rem', padding: '10px 16px', cursor: 'pointer' },
  emailDone: { color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textAlign: 'center', margin: 0 },
  resetBtn: { width: '100%', padding: '15px', background: 'linear-gradient(135deg, #ff6eb4, #a855f7)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '0.98rem', fontWeight: '800', cursor: 'pointer' },
  followUpBox: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  followUpHeading: { color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', fontWeight: '700', margin: 0 },
  followUpAnswer: { background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '12px', padding: '14px 16px' },
  followUpAnswerText: { color: 'rgba(255,255,255,0.82)', fontSize: '0.92rem', lineHeight: '1.65', margin: 0 },
  followUpRow: { display: 'flex', gap: '8px' },
  followUpInput: { flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: 'white', fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit' },
  followUpBtn: { background: 'linear-gradient(135deg, #ff6eb4, #a855f7)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '800', fontSize: '1.1rem', padding: '10px 16px', cursor: 'pointer' },
  followUpHint: { color: 'rgba(255,255,255,0.22)', fontSize: '0.74rem', margin: 0, textAlign: 'center' },
  scoreBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid', borderRadius: '999px', padding: '6px 16px', margin: '8px auto 0', },
  scoreNum: { fontWeight: '900', fontSize: '1.1rem' },
  scoreLabel: { fontSize: '0.78rem', fontWeight: '700', opacity: 0.85 },
  scoreChangeRow: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', fontWeight: '700', padding: '8px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' },
  scoreChangePts: { fontWeight: '900', fontSize: '1rem' },
  scoreChangeTotal: { color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
  streakBadge: { color: '#ff8800', fontSize: '0.75rem', fontWeight: '800', marginRight: '8px' },
  checkinBar: { background: 'rgba(168,85,247,0.08)', borderBottom: '1px solid rgba(168,85,247,0.15)', padding: '12px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', justifyContent: 'center' },
  checkinText: { color: 'rgba(255,255,255,0.55)', fontSize: '0.83rem', fontWeight: '600' },
  checkinBtns: { display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' },
  checkinBtn: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '999px', color: 'white', fontSize: '0.78rem', fontWeight: '600', padding: '5px 12px', cursor: 'pointer' },
  trendBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', border: '1px solid', borderRadius: '12px' },
  personalityBox: { border: '1px solid', borderRadius: '16px', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '6px' },
  personalityEyebrow: { color: 'rgba(255,255,255,0.25)', fontSize: '0.62rem', fontWeight: '800', letterSpacing: '0.12em', margin: 0 },
  personalityTitle: { fontSize: '1rem', fontWeight: '900', margin: 0 },
  personalityDesc: { color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 },
  friendBtn: { width: '100%', padding: '13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '12px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', textAlign: 'center' },
}
