import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST() {
  const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${host}/api/stripe/callback?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${host}/#pricing`,
  })

  return Response.json({ url: session.url })
}
