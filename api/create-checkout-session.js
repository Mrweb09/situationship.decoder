import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(501).json({ error: 'Payments not configured yet.' })
  }

  try {
    const { plan = 'monthly' } = req.body || {}
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const appUrl = process.env.APP_URL || 'https://situationship-decoder.com'
    const priceId = plan === 'annual'
      ? process.env.STRIPE_ANNUAL_PRICE_ID
      : (process.env.STRIPE_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_ID)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${appUrl}/decode?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/decode`,
    })

    return res.json({ url: session.url })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
