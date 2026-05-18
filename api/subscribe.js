export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email } = req.body || {}
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' })

  if (process.env.UPSTASH_REDIS_REST_URL) {
    const base = process.env.UPSTASH_REDIS_REST_URL
    const headers = { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
    const ts = Date.now()
    await fetch(`${base}/zadd/sd_subscribers/1/${ts}/${encodeURIComponent(email)}`, { headers }).catch(() => {})
  }

  return res.json({ success: true })
}
