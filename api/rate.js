export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { accurate } = req.body || {}
  if (typeof accurate !== 'boolean') return res.status(400).json({ error: 'accurate must be boolean' })

  if (process.env.UPSTASH_REDIS_REST_URL) {
    const base = process.env.UPSTASH_REDIS_REST_URL
    const headers = { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
    await Promise.all([
      fetch(`${base}/hincrby/sd_stats/totalVotes/1`, { headers }),
      accurate ? fetch(`${base}/hincrby/sd_stats/accurateVotes/1`, { headers }) : Promise.resolve(),
    ]).catch(() => {})
  }

  return res.json({ success: true })
}
