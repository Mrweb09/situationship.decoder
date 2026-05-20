export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { question, context } = req.body || {}
  if (!question || !context) return res.status(400).json({ error: 'Missing question or context' })

  const prompt = `You are the Situationship Decoder — brutally honest, sharp-tongued, zero patience for delusion or cope.

Here is the situation you already analysed:
- Status: ${context.status}
- Verdict: ${context.verdict}
- Interest level: ${context.confidence}%
- Analysis: ${context.explanation}
- Conversation: ${context.conversation || '(screenshot was provided)'}

The user now has a follow-up question: "${question}"

Answer in 2-4 sentences. Be direct, specific to their situation, and brutally honest. No fluff, no hedging. If they're being delusional, call it out. If they need to hear something hard, say it. Speak like a sharp, caring friend who will not sugarcoat.`

  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await apiRes.json()
    const answer = data.content?.[0]?.text || ''
    if (!answer) return res.status(500).json({ error: 'No response from AI' })

    return res.json({ answer })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
