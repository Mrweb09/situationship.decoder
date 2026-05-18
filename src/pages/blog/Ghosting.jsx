import { useNavigate } from 'react-router-dom'

export default function Ghosting() {
  const navigate = useNavigate()
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.logo} onClick={() => navigate('/')}>💀 Situationship Decoder</span>
        <button className="main-btn" style={s.cta} onClick={() => navigate('/decode')}>Decode yours →</button>
      </nav>
      <article style={s.article}>
        <p style={s.eyebrow}>SITUATIONSHIP GUIDE</p>
        <h1 style={s.h1}>Signs Someone Is About to Ghost You (Before It Happens)</h1>
        <p style={s.lead}>Ghosting rarely comes out of nowhere. There are almost always warning signs in the texts before someone goes quiet for good. Here's what to look for.</p>

        <h2 style={s.h2}>What Is Ghosting?</h2>
        <p style={s.p}>Ghosting is when someone you've been talking to — or dating — suddenly cuts off all contact with no explanation. No breakup conversation, no reason given. They just disappear. It's become one of the most common ways people end situationships.</p>

        <h2 style={s.h2}>Early Warning Signs in Texts</h2>
        <ul style={s.list}>
          {[
            'Replies get shorter — paragraphs become sentences, sentences become "k"',
            'Response time gets longer with no explanation',
            'They stop asking you questions — conversations become one-sided',
            'They leave you on read more frequently',
            '"Delivered" sits for hours where it used to be minutes',
            'They stop initiating — you\'re always the one texting first',
            'Energy drops after plans get made or a deeper conversation happens',
          ].map((item, i) => <li key={i} style={s.li}>→ {item}</li>)}
        </ul>

        <h2 style={s.h2}>Why Do People Ghost Instead of Just Saying Something?</h2>
        <p style={s.p}>Most people ghost because they're conflict-avoidant. Ending things directly feels harder than just fading out, so they take the path of least resistance — for them. It has nothing to do with your worth and everything to do with their emotional immaturity.</p>

        <h2 style={s.h2}>What to Do If You Suspect It's Coming</h2>
        <p style={s.p}>Don't panic-text. One follow-up message is enough. If they don't respond, you have your answer. Chasing someone who's already half-gone only delays the inevitable and costs you your dignity.</p>
        <p style={s.p}>The harder truth: if someone wanted to talk to you, they would be. The signs are usually there before the silence hits.</p>

        <div style={s.ctaBox}>
          <p style={s.ctaTitle}>Think ghosting might be incoming?</p>
          <p style={s.ctaSub}>Paste your conversation and find out exactly where you stand before it's too late.</p>
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
