import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || '/api'

const STATUSES = [
  { status: "Rizz Detected", color: "#44ff88", emoji: "🔥", desc: "They're obsessed — enjoy it" },
  { status: "Catching Feelings", color: "#44bbff", emoji: "💕", desc: "It's going somewhere real" },
  { status: "Lowkey Interested", color: "#ffcc00", emoji: "👀", desc: "Interested but playing it cool" },
  { status: "Breadcrumbing", color: "#ff8800", emoji: "🍞", desc: "Keeping you on the hook" },
  { status: "Ghosting Incoming", color: "#ff4444", emoji: "👻", desc: "The writing is on the wall" },
]

const TESTIMONIALS = [
  { text: "sent my whole situationship conversation and got told 'ghosting incoming' with a confidence of 91%. blocked him the next day. i'm healed.", handle: "@maya.irl", emoji: "😭" },
  { text: "this is actually scary accurate. it called out the breadcrumbing before i even realized that's what was happening lmaooo", handle: "@jess_nvm", emoji: "💀" },
  { text: "used it 4 times in one night because i have no chill and zero regrets. the unhinged reply suggestions are sending me", handle: "@ty__online", emoji: "😭" },
]

const FAQS = [
  {
    q: "How does it work?",
    a: "You paste your conversation and our AI analyzes the language patterns, response timing cues, engagement levels, and emotional signals to give you an honest read on the situation.",
  },
  {
    q: "Is my conversation private?",
    a: "Your conversations are sent to the AI for analysis and are never stored, logged, or used for training. Each decode is processed and immediately discarded.",
  },
  {
    q: "How accurate is it?",
    a: "Scarily accurate for most people. It's trained to spot patterns humans often rationalize away — like one-word replies after paragraphs, or enthusiasm that only appears when they want something.",
  },
  {
    q: "What's the difference between Free and Pro?",
    a: "Free gives you 3 full decodes with all analysis included. Pro unlocks unlimited decodes plus shareable image cards perfect for sending to your friends.",
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [liveStats, setLiveStats] = useState(null)

  useEffect(() => {
    fetch(`${API}/stats`)
      .then(r => r.json())
      .then(data => { if (data.total >= 5) setLiveStats(data) })
      .catch(() => {})
  }, [])

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <span style={s.navLogo}>💀 Situationship Decoder</span>
        <button className="main-btn" style={s.navCta} onClick={() => navigate('/decode')}>
          Try it free →
        </button>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroOrb1} />
        <div style={s.heroOrb2} />
        <div style={s.heroInner}>
          <p style={s.heroBadge}>
            ✨ AI-powered · Free to try
            {liveStats?.accuracyPct != null && ` · ${liveStats.accuracyPct}% say it's accurate`}
          </p>
          <h1 style={s.h1}>
            Stop texting your friends.<br />
            <span style={s.h1Accent}>Get an AI opinion.</span>
          </h1>
          <p style={s.heroSub}>
            Paste your conversation. Find out exactly where you stand — brutally honest, no sugarcoating, no "maybe he's just busy."
          </p>
          <button className="main-btn" style={s.heroCta} onClick={() => navigate('/decode')}>
            Decode My Situation — It's Free
          </button>
          <p style={s.heroMeta}>No sign-up. No BS. Results in 10 seconds.</p>
        </div>
      </section>

      {/* Testimonials */}
      <section style={s.section}>
        <div style={s.testimonialGrid}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={s.testimonialCard}>
              <p style={s.testimonialEmoji}>{t.emoji}</p>
              <p style={s.testimonialText}>"{t.text}"</p>
              <p style={s.testimonialHandle}>{t.handle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending verdicts */}
      {liveStats && liveStats.total >= 5 && (() => {
        const counts = liveStats.statusCounts || {}
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3)
        const STATUS_COLORS = { 'Ghosting Incoming': '#ff4444', 'Breadcrumbing': '#ff8800', 'Lowkey Interested': '#ffcc00', 'Catching Feelings': '#44bbff', 'Rizz Detected': '#44ff88' }
        const STATUS_EMOJI = { 'Ghosting Incoming': '👻', 'Breadcrumbing': '🍞', 'Lowkey Interested': '👀', 'Catching Feelings': '💕', 'Rizz Detected': '🔥' }
        return (
          <section style={s.section}>
            <p style={s.sectionEyebrow}>TRENDING THIS WEEK</p>
            <h2 style={s.sectionTitle}>What's actually going on out there</h2>
            <div style={s.trendingGrid}>
              {sorted.map(([status, count], i) => {
                const pct = Math.round((count / liveStats.total) * 100)
                const color = STATUS_COLORS[status] || '#888'
                return (
                  <div key={status} style={{ ...s.trendingCard, border: `1px solid ${color}33` }}>
                    <div style={s.trendingTop}>
                      <span style={s.trendingEmoji}>{STATUS_EMOJI[status]}</span>
                      {i === 0 && <span style={s.trendingTopBadge}>Most common</span>}
                    </div>
                    <p style={{ ...s.trendingStatus, color }}>{status}</p>
                    <div style={s.trendingBarTrack}>
                      <div style={{ ...s.trendingBarFill, width: `${pct}%`, background: color }} />
                    </div>
                    <p style={s.trendingPct}>{pct}% of situations</p>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })()}

      {/* How it works */}
      <section style={s.section}>
        <p style={s.sectionEyebrow}>HOW IT WORKS</p>
        <h2 style={s.sectionTitle}>Three steps to the truth</h2>
        <div style={s.stepsGrid}>
          {[
            { n: "01", icon: "📋", title: "Paste your convo", body: "Copy and paste your text messages — both sides of the conversation." },
            { n: "02", icon: "🔮", title: "AI reads everything", body: "Every word, every reply gap, every 'k.' — nothing gets missed." },
            { n: "03", icon: "💀", title: "Get the truth", body: "Your verdict, interest level, and exactly what to say next." },
          ].map((step, i) => (
            <div key={i} style={s.stepCard}>
              <div style={s.stepNum}>{step.n}</div>
              <div style={s.stepIcon}>{step.icon}</div>
              <h3 style={s.stepTitle}>{step.title}</h3>
              <p style={s.stepBody}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Status showcase */}
      <section style={s.section}>
        <p style={s.sectionEyebrow}>THE VERDICTS</p>
        <h2 style={s.sectionTitle}>5 brutally honest outcomes</h2>
        <p style={s.sectionSub}>Every situation gets classified into one of these</p>
        <div style={s.statusGrid}>
          {STATUSES.map((item, i) => (
            <div
              key={i}
              style={{
                ...s.statusCard,
                border: `1px solid ${item.color}33`,
                boxShadow: `0 0 24px ${item.color}0d`,
              }}
            >
              <span style={s.statusEmoji}>{item.emoji}</span>
              <span style={{ ...s.statusName, color: item.color }}>{item.status}</span>
              <span style={s.statusDesc}>{item.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={s.section} id="pricing">
        <p style={s.sectionEyebrow}>PRICING</p>
        <h2 style={s.sectionTitle}>Simple. Honest. No tricks.</h2>
        <div style={s.pricingGrid}>
          {/* Free */}
          <div style={s.pricingCard}>
            <h3 style={s.planName}>Free</h3>
            <div style={s.planPrice}>$0</div>
            <p style={s.planDesc}>Try it, trust it, upgrade when ready</p>
            <ul style={s.featureList}>
              {["3 full decodes", "Full AI analysis", "3 reply suggestions (Safe / Bold / Unhinged)", "Conversation history"].map((f, i) => (
                <li key={i} style={s.feature}><span style={s.checkFree}>✓</span>{f}</li>
              ))}
            </ul>
            <button className="ghost-btn" style={s.planBtnFree} onClick={() => navigate('/decode')}>
              Start for free
            </button>
          </div>

          {/* Pro */}
          <div style={{ ...s.pricingCard, ...s.pricingCardPro }}>
            <div style={s.popularTag}>✦ Most Popular</div>
            <h3 style={{ ...s.planName, color: '#c084fc' }}>Pro</h3>
            <div style={s.planPrice}>
              $4.99<span style={s.planPricePer}>/mo</span>
            </div>
            <p style={s.planDesc}>For the chronically in your feelings</p>
            <ul style={s.featureList}>
              {[
                "Unlimited decodes",
                "Shareable image cards (Instagram/TikTok)",
                "Full AI analysis",
                "3 reply suggestions",
                "Conversation history",
                "Priority AI model",
              ].map((f, i) => (
                <li key={i} style={s.feature}><span style={s.checkPro}>✓</span>{f}</li>
              ))}
            </ul>
            <button className="main-btn" style={s.planBtnPro} onClick={() => navigate('/decode')}>
              Get started free →
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={s.section}>
        <p style={s.sectionEyebrow}>FAQ</p>
        <h2 style={s.sectionTitle}>Questions</h2>
        <div style={s.faqList}>
          {FAQS.map((item, i) => (
            <div key={i} style={s.faqItem}>
              <h4 style={s.faqQ}>{item.q}</h4>
              <p style={s.faqA}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={s.ctaSection}>
        <h2 style={s.ctaTitle}>Your texts are already telling a story.</h2>
        <p style={s.ctaSub}>Find out what it actually says.</p>
        <button className="main-btn" style={s.heroCta} onClick={() => navigate('/decode')}>
          Decode My Situation →
        </button>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <p style={s.footerLogo}>💀 Situationship Decoder</p>
        <p style={s.footerSub}>Built for everyone who's ever stared at "delivered" for too long.</p>
        <p style={s.footerLinks}>
          <a href="#pricing" style={s.footerLink}>Pricing</a>
          <span style={s.footerDot}>·</span>
          <a href="mailto:hello@situationship-decoder.app" style={s.footerLink}>Contact</a>
        </p>
      </footer>
    </div>
  )
}

const s = {
  page: {
    background: "linear-gradient(160deg, #06060f 0%, #0d0820 60%, #06060f 100%)",
    minHeight: "100vh",
    color: "white",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    overflowX: "hidden",
  },
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    background: "rgba(6,6,15,0.85)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  navLogo: {
    fontWeight: "800",
    fontSize: "1rem",
    background: "linear-gradient(135deg, #ff6eb4, #a855f7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  navCta: {
    padding: "9px 20px",
    background: "linear-gradient(135deg, #ff6eb4, #a855f7)",
    border: "none",
    borderRadius: "999px",
    color: "white",
    fontSize: "0.85rem",
    fontWeight: "700",
    cursor: "pointer",
  },
  hero: {
    position: "relative",
    textAlign: "center",
    padding: "100px 24px 80px",
    overflow: "hidden",
  },
  heroOrb1: {
    position: "absolute",
    top: "-100px",
    left: "50%",
    transform: "translateX(-60%)",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroOrb2: {
    position: "absolute",
    top: "50px",
    right: "-100px",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(255,110,180,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroInner: {
    position: "relative",
    maxWidth: "700px",
    margin: "0 auto",
  },
  heroBadge: {
    display: "inline-block",
    background: "rgba(168,85,247,0.12)",
    border: "1px solid rgba(168,85,247,0.25)",
    color: "#c084fc",
    padding: "6px 16px",
    borderRadius: "999px",
    fontSize: "0.82rem",
    fontWeight: "600",
    marginBottom: "28px",
  },
  h1: {
    fontSize: "clamp(2.4rem, 7vw, 4rem)",
    fontWeight: "900",
    lineHeight: "1.15",
    marginBottom: "20px",
    color: "white",
  },
  h1Accent: {
    background: "linear-gradient(135deg, #ff6eb4, #a855f7, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSub: {
    fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
    color: "rgba(255,255,255,0.5)",
    lineHeight: "1.7",
    maxWidth: "540px",
    margin: "0 auto 36px",
  },
  heroCta: {
    display: "inline-block",
    padding: "18px 36px",
    background: "linear-gradient(135deg, #ff6eb4, #a855f7)",
    border: "none",
    borderRadius: "14px",
    color: "white",
    fontSize: "1.05rem",
    fontWeight: "800",
    cursor: "pointer",
    letterSpacing: "0.01em",
  },
  heroMeta: {
    marginTop: "14px",
    color: "rgba(255,255,255,0.2)",
    fontSize: "0.8rem",
  },
  section: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "80px 24px",
  },
  sectionEyebrow: {
    color: "#a855f7",
    fontSize: "0.72rem",
    fontWeight: "800",
    letterSpacing: "0.14em",
    textAlign: "center",
    margin: "0 0 12px",
  },
  sectionTitle: {
    fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
    fontWeight: "900",
    textAlign: "center",
    margin: "0 0 14px",
    color: "white",
  },
  sectionSub: {
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    marginBottom: "40px",
    fontSize: "1rem",
  },
  testimonialGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "0 24px",
  },
  testimonialCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "20px",
    padding: "24px",
  },
  testimonialEmoji: {
    fontSize: "1.8rem",
    margin: "0 0 12px",
  },
  testimonialText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: "0.93rem",
    lineHeight: "1.65",
    margin: "0 0 14px",
    fontStyle: "italic",
  },
  testimonialHandle: {
    color: "rgba(255,255,255,0.28)",
    fontSize: "0.78rem",
    fontWeight: "600",
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    marginTop: "40px",
  },
  stepCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "20px",
    padding: "28px 24px",
  },
  stepNum: {
    color: "rgba(168,85,247,0.4)",
    fontSize: "0.75rem",
    fontWeight: "800",
    letterSpacing: "0.1em",
    marginBottom: "12px",
  },
  stepIcon: {
    fontSize: "2rem",
    marginBottom: "14px",
  },
  stepTitle: {
    fontSize: "1.1rem",
    fontWeight: "800",
    color: "white",
    margin: "0 0 8px",
  },
  stepBody: {
    color: "rgba(255,255,255,0.45)",
    fontSize: "0.9rem",
    lineHeight: "1.6",
    margin: 0,
  },
  statusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginTop: "36px",
  },
  statusCard: {
    background: "rgba(255,255,255,0.03)",
    borderRadius: "16px",
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  statusEmoji: {
    fontSize: "1.6rem",
  },
  statusName: {
    fontSize: "0.85rem",
    fontWeight: "800",
  },
  statusDesc: {
    color: "rgba(255,255,255,0.35)",
    fontSize: "0.78rem",
    lineHeight: "1.4",
  },
  pricingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    maxWidth: "700px",
    margin: "40px auto 0",
  },
  pricingCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "32px 28px",
    display: "flex",
    flexDirection: "column",
    gap: "0",
  },
  pricingCardPro: {
    background: "rgba(168,85,247,0.07)",
    border: "1px solid rgba(168,85,247,0.25)",
    position: "relative",
  },
  popularTag: {
    position: "absolute",
    top: "-14px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "linear-gradient(135deg, #ff6eb4, #a855f7)",
    color: "white",
    fontSize: "0.72rem",
    fontWeight: "800",
    padding: "5px 16px",
    borderRadius: "999px",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
  },
  planName: {
    fontSize: "1.1rem",
    fontWeight: "800",
    color: "rgba(255,255,255,0.7)",
    margin: "0 0 8px",
  },
  planPrice: {
    fontSize: "2.6rem",
    fontWeight: "900",
    color: "white",
    margin: "0 0 6px",
    lineHeight: "1",
  },
  planPricePer: {
    fontSize: "1rem",
    fontWeight: "500",
    color: "rgba(255,255,255,0.4)",
  },
  planDesc: {
    color: "rgba(255,255,255,0.35)",
    fontSize: "0.82rem",
    margin: "0 0 24px",
  },
  featureList: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 28px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    flex: 1,
  },
  feature: {
    display: "flex",
    gap: "10px",
    color: "rgba(255,255,255,0.65)",
    fontSize: "0.88rem",
    alignItems: "flex-start",
  },
  checkFree: {
    color: "rgba(255,255,255,0.3)",
    fontWeight: "700",
    flexShrink: 0,
  },
  checkPro: {
    color: "#a855f7",
    fontWeight: "700",
    flexShrink: 0,
  },
  planBtnFree: {
    width: "100%",
    padding: "14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.95rem",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "auto",
  },
  planBtnPro: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #ff6eb4, #a855f7)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "0.95rem",
    fontWeight: "800",
    cursor: "pointer",
    marginTop: "auto",
  },
  faqList: {
    maxWidth: "660px",
    margin: "36px auto 0",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  faqItem: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    padding: "22px 24px",
  },
  faqQ: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "white",
    margin: "0 0 10px",
  },
  faqA: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.92rem",
    lineHeight: "1.7",
    margin: 0,
  },
  ctaSection: {
    textAlign: "center",
    padding: "80px 24px 100px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  ctaTitle: {
    fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
    fontWeight: "900",
    margin: "0 0 12px",
    color: "white",
  },
  ctaSub: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "1.05rem",
    margin: "0 0 36px",
  },
  footer: {
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "40px 24px",
    textAlign: "center",
  },
  footerLogo: {
    fontWeight: "800",
    background: "linear-gradient(135deg, #ff6eb4, #a855f7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "8px",
    fontSize: "1rem",
  },
  footerSub: {
    color: "rgba(255,255,255,0.2)",
    fontSize: "0.82rem",
    marginBottom: "16px",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    alignItems: "center",
  },
  footerLink: {
    color: "rgba(255,255,255,0.25)",
    fontSize: "0.8rem",
    textDecoration: "none",
  },
  footerDot: {
    color: "rgba(255,255,255,0.15)",
    fontSize: "0.8rem",
  },
  trendingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "14px",
    marginTop: "32px",
  },
  trendingCard: {
    background: "rgba(255,255,255,0.03)",
    borderRadius: "18px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  trendingTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trendingEmoji: { fontSize: "1.6rem" },
  trendingTopBadge: {
    background: "rgba(168,85,247,0.15)",
    border: "1px solid rgba(168,85,247,0.25)",
    color: "#c084fc",
    fontSize: "0.65rem",
    fontWeight: "800",
    padding: "3px 9px",
    borderRadius: "999px",
    letterSpacing: "0.04em",
  },
  trendingStatus: {
    fontSize: "0.88rem",
    fontWeight: "800",
    margin: 0,
  },
  trendingBarTrack: {
    height: "6px",
    background: "rgba(255,255,255,0.07)",
    borderRadius: "999px",
    overflow: "hidden",
  },
  trendingBarFill: {
    height: "100%",
    borderRadius: "999px",
    opacity: 0.7,
  },
  trendingPct: {
    color: "rgba(255,255,255,0.3)",
    fontSize: "0.75rem",
    margin: 0,
  },
}
