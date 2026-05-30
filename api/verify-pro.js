import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { sessionId } = req.body || {}
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' })

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(501).json({ error: 'Payments not configured' })
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return res.status(402).json({ pro: false, error: 'Payment not completed' })
    }

    const email = session.customer_details?.email?.toLowerCase()

    if (email && process.env.UPSTASH_REDIS_REST_URL) {
      const base = process.env.UPSTASH_REDIS_REST_URL
      const headers = { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
      await fetch(`${base}/hset/sd_pro_users/${encodeURIComponent(email)}/1`, { headers }).catch(() => {})
    }

    return res.json({ pro: true, email })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
