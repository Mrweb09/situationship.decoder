import { useNavigate } from 'react-router-dom'

export default function Breadcrumbing() {
  const navigate = useNavigate()
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.logo} onClick={() => navigate('/')} >💀 Situationship Decoder</span>
        <button className="main-btn" style={s.cta} onClick={() => navigate('/decode')}>Decode yours →</button>
      </nav>
      <article style={s.article}>
        <p style={s.eyebrow}>SITUATIONSHIP GUIDE</p>
        <h1 style={s.h1}>What is Breadcrumbing? (And Are You Being Breadcrumbed?)</h1>
        <p style={s.lead}>Breadcrumbing is when someone gives you just enough attention to keep you interested — without ever committing to anything real. Think of it as emotional bait.</p>

        <h2 style={s.h2}>What Breadcrumbing Looks Like</h2>
        <p style={s.p}>The person you're talking to texts you out of nowhere after days of silence. They like your posts. They send memes. They say things like "we should hang out soon" — but soon never comes. Every time you start to move on, they reappear just enough to pull you back.</p>
        <p style={s.p}>It's not accidental. Breadcrumbing is a pattern. They keep the connection alive because it costs them nothing, while you're left wondering where you stand.</p>

        <h2 style={s.h2}>Signs You're Being Breadcrumbed</h2>
        <ul style={s.list}>
          {[
            'They initiate contact but never follow through on plans',
            'Replies are inconsistent — sometimes fast, sometimes days later',
            'They say things like "I miss you" or "we need to catch up" with no action',
            'Every conversation ends with nothing concrete',
            'They appear right when you\'ve started to move on',
            'They\'re always "busy" but never too busy to text',
          ].map((item, i) => <li key={i} style={s.li}>{item}</li>)}
        </ul>

        <h2 style={s.h2}>Why Do People Breadcrumb?</h2>
        <p style={s.p}>Usually it's one of three things: they want the ego boost of knowing you're interested, they're keeping you as a backup option, or they're emotionally unavailable but don't want to fully let go. None of these are about you — they're about them.</p>

        <h2 style={s.h2}>What to Do About It</h2>
        <p style={s.p}>The honest answer is to stop responding and see what happens. If they only ever reach out when you go quiet, that tells you everything. You deserve someone who makes actual plans, not someone who keeps you on the hook indefinitely.</p>

        <div style={s.ctaBox}>
          <p style={s.ctaTitle}>Not sure if you're being breadcrumbed?</p>
          <p style={s.ctaSub}>Paste your conversation and get an instant AI read — free, brutal, accurate.</p>
          <button className="main-btn" style={s.ctaBtn} onClick={() => navigate('/decode')}>Decode My Situation 💀</button>
        </div>
      </article>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(160deg, #06060f 0%, #0d0820 60%, #06060f 100%)', color: 'white', fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: 'rgba(6,6,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontWeight: '800', fontSize: '1rem', background: 'linear-gradient(135deg,#ff6eb4,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', cursor: 'pointer' },
  cta: { padding: '9px 20px', background: 'linear-gradient(135deg,#ff6eb4,#a855f7)', border: 'none', borderRadius: '999px', color: 'white', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' },
  article: { maxWidth: '680px', margin: '0 auto', padding: '60px 24px 100px' },
  eyebrow: { color: '#a855f7', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.14em', margin: '0 0 16px' },
  h1: { fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: '900', lineHeight: '1.2', margin: '0 0 24px', color: 'white' },
  lead: { fontSize: '1.15rem', color: 'rgba(255,255,255,0.65)', lineHeight: '1.75', margin: '0 0 40px', borderLeft: '3px solid #a855f7', paddingLeft: '20px' },
  h2: { fontSize: '1.3rem', fontWeight: '800', color: 'white', margin: '40px 0 14px' },
  p: { color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', fontSize: '1rem', margin: '0 0 16px' },
  list: { paddingLeft: '0', margin: '0 0 16px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' },
  li: { color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', fontSize: '1rem', paddingLeft: '20px', position: 'relative', before: { content: '"→"' } },
  ctaBox: { marginTop: '60px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '20px', padding: '32px', textAlign: 'center' },
  ctaTitle: { fontSize: '1.3rem', fontWeight: '800', color: 'white', margin: '0 0 8px' },
  ctaSub: { color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', margin: '0 0 24px' },
  ctaBtn: { padding: '16px 32px', background: 'linear-gradient(135deg,#ff6eb4,#a855f7)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '1rem', fontWeight: '800', cursor: 'pointer' },
}
