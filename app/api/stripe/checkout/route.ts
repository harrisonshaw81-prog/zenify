import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const { plan } = await request.json().catch(() => ({ plan: 'monthly' }))
    const priceId = plan === 'annual'
      ? process.env.STRIPE_ANNUAL_PRICE_ID!
      : process.env.STRIPE_PRICE_ID!

    const host = process.env.NEXT_PUBLIC_BASE_URL
    if (!host && process.env.NODE_ENV === 'production') {
      return Response.json({ error: 'Server misconfiguration. Please contact support.' }, { status: 500 })
    }
    const baseUrl = host || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/api/stripe/callback?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
    })

    return Response.json({ url: session.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[stripe checkout]', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}
