import { useNavigate } from 'react-router-dom'

export default function WhatIsASituationship() {
  const navigate = useNavigate()
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.logo} onClick={() => navigate('/')}>💀 Situationship Decoder</span>
        <button className="main-btn" style={s.cta} onClick={() => navigate('/decode')}>Decode yours →</button>
      </nav>
      <article style={s.article}>
        <p style={s.eyebrow}>SITUATIONSHIP GUIDE</p>
        <h1 style={s.h1}>What Is a Situationship? (And Are You in One?)</h1>
        <p style={s.lead}>A situationship is a romantic connection that has all the feelings of a relationship — without the label, the commitment, or the clarity. It lives in the grey area nobody wants to talk about.</p>

        <h2 style={s.h2}>The Definition</h2>
        <p style={s.p}>Unlike a casual hookup (which both people understand is casual) or a relationship (which both people have agreed to), a situationship is ambiguous by design. One or both people avoid defining it because defining it would force a decision nobody wants to make.</p>

        <h2 style={s.h2}>Signs You're in a Situationship</h2>
        <ul style={s.list}>
          {[
            'You spend time together regularly but have never had "the talk"',
            'You\'re not sure if you\'re allowed to see other people',
            'You act like a couple but don\'t use that word',
            'Future plans are vague — "we should go there sometime" not "let\'s book it"',
            'You overthink every text before sending it',
            'You\'d describe it to a friend as "it\'s complicated"',
            'One of you cares more than the other and you both know it',
          ].map((item, i) => <li key={i} style={s.li}>→ {item}</li>)}
        </ul>

        <h2 style={s.h2}>Why Do Situationships Happen?</h2>
        <p style={s.p}>Usually because one person isn't ready to commit but doesn't want to lose you either. Or both people enjoy the connection but are scared of what labelling it might mean. Either way, the result is the same: feelings without structure.</p>

        <h2 style={s.h2}>Are Situationships Always Bad?</h2>
        <p style={s.p}>Not always — but they become toxic when one person wants more and the other doesn't. If you're both genuinely happy with the ambiguity, that's fine. But if you're secretly hoping they'll come around, you're investing in something that may never pay off.</p>

        <h2 style={s.h2}>How to Get Out of a Situationship</h2>
        <p style={s.p}>Have the conversation you've been avoiding. Ask directly: "What are we?" The answer — or the way they avoid answering — will tell you everything you need to know. You can't wait indefinitely for someone to decide if they want you.</p>

        <div style={s.ctaBox}>
          <p style={s.ctaTitle}>Want to know where you actually stand?</p>
          <p style={s.ctaSub}>Paste your conversation. The AI will tell you exactly what's going on — no sugarcoating.</p>
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
  li: { color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', fontSize: '1rem' },
  ctaBox: { marginTop: '60px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '20px', padding: '32px', textAlign: 'center' },
  ctaTitle: { fontSize: '1.3rem', fontWeight: '800', color: 'white', margin: '0 0 8px' },
  ctaSub: { color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', margin: '0 0 24px' },
  ctaBtn: { padding: '16px 32px', background: 'linear-gradient(135deg,#ff6eb4,#a855f7)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '1rem', fontWeight: '800', cursor: 'pointer' },
}
