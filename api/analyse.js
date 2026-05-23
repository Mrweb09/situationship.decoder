export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
}

const MODE_PERSONAS = {
  brutal: `You are the Situationship Decoder — brutally honest, sharp-tongued, zero patience for delusion. No sugarcoating, no softening. Say exactly what you see.`,
  bestfriend: `You are the Delusional Best Friend — supportive but slightly unhinged, you see the BEST in every situation even when you shouldn't. You're on their side, maybe too much. You acknowledge red flags but immediately explain them away.`,
  therapist: `You are a calm, empathetic therapist. You use measured language, validate feelings, and offer balanced perspective. You don't take sides. You speak with warmth and clinical insight.`,
  toxic: `You are the Toxic Friend — dramatic, chaotic, always ready to escalate. You read into EVERYTHING. You encourage bold moves and see conspiracy in every late reply. You're fun but terrible advice.`,
  fbi: `You are an FBI behavioural analyst. You are methodical, precise, and clinical. You analyse communication patterns like evidence. You cite specific messages as "exhibits". You reach a definitive conclusion.`,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { conversation, imageData, imageType, mode = 'brutal' } = req.body || {}
  if (!conversation && !imageData) return res.status(400).json({ error: 'No conversation or image provided' })

  const persona = MODE_PERSONAS[mode] || MODE_PERSONAS.brutal

  const prompt = `${persona} Analyse the conversation and respond ONLY with valid JSON. No markdown, no backticks, nothing outside the JSON.

Format (follow exactly):
{"verdict":"string","status":"string","confidence":number,"explanation":"string","replies":["string","string","string"],"translations":[{"said":"string","actually":"string"}],"effort":{"you":number,"them":number},"predictions":[{"event":"string","pct":number},{"event":"string","pct":number},{"event":"string","pct":number}]}

Rules:
- verdict: One punchy specific sentence matching the persona's voice. Reference actual behaviour.
- status: EXACTLY one of: Ghosting Incoming / Breadcrumbing / Lowkey Interested / Catching Feelings / Rizz Detected / Benching / Love Bombing / Zombie Mode
  - Ghosting Incoming: pulling away, delays getting longer, energy dying
  - Breadcrumbing: just enough attention to keep you hooked, no real effort
  - Lowkey Interested: genuinely interested but playing it cool
  - Catching Feelings: clearly developing real feelings, warmer and more present
  - Rizz Detected: fully into you, confident and consistent
  - Benching: keeping you as a backup while pursuing others, hot and cold
  - Love Bombing: excessive flattery and intensity too fast — unsustainable and a red flag
  - Zombie Mode: ghosted before and came back like nothing happened
- confidence: Integer 0–100, how interested THEY are.
- explanation: 2–3 sentences in the persona's voice. Reference specific patterns.
- replies: Exactly 3 replies in the persona's style:
  [0] Safe — low-effort, chill
  [1] Bold — genuine interest, slightly flirty
  [2] Unhinged — chaotic, funny, the 2am text
- translations: 3–5 of the most telling messages from THEIR side. What they said and what it actually meant.
- effort: Emotional effort percentage — you (the user) vs them. Integer 0–100 each. Based on message length, initiation, enthusiasm, vulnerability. Example: {"you":72,"them":31}
- predictions: Exactly 3 predictions about what happens next. Short event description and percentage likelihood. Example: [{"event":"They ghost within 2 weeks","pct":71},{"event":"They double text first","pct":22},{"event":"This turns into something real","pct":12}]
${conversation ? `\nConversation:\n${conversation}` : '\nAnalyse the conversation shown in the image above.'}`

  try {
    const content = imageData
      ? [
          { type: 'image', source: { type: 'base64', media_type: imageType || 'image/jpeg', data: imageData } },
          { type: 'text', text: prompt },
        ]
      : prompt

    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1800,
        messages: [{ role: 'user', content }],
      }),
    })

    const data = await apiRes.json()
    const text = data.content?.[0]?.text || ''

    let parsed
    try { parsed = JSON.parse(text) }
    catch { return res.status(500).json({ error: 'Invalid AI response', raw: text }) }

    if (parsed.status && process.env.UPSTASH_REDIS_REST_URL) {
      const base = process.env.UPSTASH_REDIS_REST_URL
      const headers = { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
      const field = parsed.status.replace(/\s+/g, '_')
      await Promise.all([
        fetch(`${base}/hincrby/sd_status_counts/${encodeURIComponent(field)}/1`, { headers }).catch(() => {}),
        fetch(`${base}/hincrby/sd_stats/total/1`, { headers }).catch(() => {}),
      ])
    }

    return res.json(parsed)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
