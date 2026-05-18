export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return res.json({ totalVotes: 0, accurateVotes: 0, statusCounts: {}, total: 0, accuracyPct: null })
  }

  try {
    const base = process.env.UPSTASH_REDIS_REST_URL
    const headers = { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }

    const [statsRes, countsRes] = await Promise.all([
      fetch(`${base}/hgetall/sd_stats`, { headers }),
      fetch(`${base}/hgetall/sd_status_counts`, { headers }),
    ])
    const [statsData, countsData] = await Promise.all([statsRes.json(), countsRes.json()])

    const toObj = (arr) => {
      if (!Array.isArray(arr)) return {}
      const obj = {}
      for (let i = 0; i < arr.length; i += 2) obj[arr[i]] = arr[i + 1]
      return obj
    }

    const statsObj = toObj(statsData.result)
    const countsObj = toObj(countsData.result)

    const totalVotes = parseInt(statsObj.totalVotes || 0)
    const accurateVotes = parseInt(statsObj.accurateVotes || 0)

    const statusCounts = {}
    for (const [k, v] of Object.entries(countsObj)) {
      statusCounts[k.replace(/_/g, ' ')] = parseInt(v)
    }

    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0)
    const accuracyPct = totalVotes > 0 ? Math.round((accurateVotes / totalVotes) * 100) : null

    return res.json({ totalVotes, accurateVotes, statusCounts, total, accuracyPct })
  } catch (err) {
    console.error(err)
    return res.json({ totalVotes: 0, accurateVotes: 0, statusCounts: {}, total: 0, accuracyPct: null })
  }
}
