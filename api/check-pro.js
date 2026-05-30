export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email } = req.body || {}
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' })

  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return res.json({ pro: false })
  }

  try {
    const base = process.env.UPSTASH_REDIS_REST_URL
    const headers = { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
    const resp = await fetch(`${base}/hget/sd_pro_users/${encodeURIComponent(email.toLowerCase())}`, { headers })
    const data = await resp.json()
    return res.json({ pro: data.result === '1' })
  } catch (err) {
    console.error(err)
    return res.json({ pro: false })
  }
}
