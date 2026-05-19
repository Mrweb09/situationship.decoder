export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { conversation, imageData, imageType } = req.body || {}
  if (!conversation && !imageData) return res.status(400).json({ error: 'No conversation or image provided' })

  const prompt = `You are the Situationship Decoder — brutally honest, sharp-tongued, zero patience for delusion. Analyse the conversation and respond ONLY with valid JSON. No markdown, no backticks, nothing outside the JSON.

Format (follow exactly):
{"verdict":"string","status":"string","confidence":number,"explanation":"string","replies":["string","string","string"],"translations":[{"said":"string","actually":"string"}]}

Rules:
- verdict: One punchy specific sentence. Reference actual behaviour from the conversation. Be direct and a little savage.
- status: EXACTLY one of: Ghosting Incoming / Breadcrumbing / Lowkey Interested / Catching Feelings / Rizz Detected / Benching / Love Bombing / Zombie Mode
  - Ghosting Incoming: pulling away, delays getting longer, energy dying
  - Breadcrumbing: just enough attention to keep you hooked, no real effort
  - Lowkey Interested: genuinely interested but playing it cool
  - Catching Feelings: clearly developing real feelings, warmer and more present
  - Rizz Detected: fully into you, confident and consistent
  - Benching: keeping you as a backup while pursuing others, hot and cold
  - Love Bombing: excessive flattery and intensity too fast — unsustainable and a red flag
  - Zombie Mode: ghosted before and came back like nothing happened
- confidence: Integer 0–100, how interested THEY are (not how interested the user is).
- explanation: 2–3 sentences of sharp honest analysis. Call out specific patterns in THIS conversation.
- replies: Exactly 3 replies tailored to this conversation:
  [0] Safe — low-effort, chill, doesn't show cards
  [1] Bold — genuine interest, slightly flirty, has confidence
  [2] Unhinged — chaotic, funny, the 2am text you regret
- translations: Pick 3–5 of the most telling messages from THEIR side only (not the user's messages). For each, write exactly what they said and what it actually meant. Be specific — translate mixed signals, vague language, and emotional avoidance into plain English. Example: {"said":"omg been so busy lately","actually":"I saw your text and needed 3 days to decide if I liked you enough to reply"}
${conversation ? `\nConversation:\n${conversation}` : '\nAnalyse the conversation shown in the image above.'}`

  try {
    const content = imageData
      ? [
          { type: 'image', source: { type: 'base64', media_type: imageType || 'image/jpeg', data: imageData } },
          { type: 'text', text: prompt },
        ]
      : prompt + (conversation ? '' : '')

    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content }],
      }),
    })

    const data = await apiRes.json()
    const text = data.content?.[0]?.text || ''

    let parsed
    try { parsed = JSON.parse(text) }
    catch { return res.status(500).json({ error: 'Invalid AI response', raw: text }) }

    if (parsed.status && process.env.UPSTASH_REDIS_REST_URL) {
      const field = parsed.status.replace(/\s+/g, '_')
      await fetch(
        `${process.env.UPSTASH_REDIS_REST_URL}/hincrby/sd_status_counts/${encodeURIComponent(field)}/1`,
        { headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } }
      ).catch(() => {})
    }

    return res.json(parsed)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
