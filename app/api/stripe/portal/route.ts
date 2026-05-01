import Stripe from 'stripe'
import { cookies } from 'next/headers'
import { verifyProCookie, COOKIE_NAME } from '@/lib/pro-cookie'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const isPro = verifyProCookie(cookieStore.get(COOKIE_NAME)?.value)
    if (!isPro) {
      return Response.json({ error: 'No active Pro subscription.' }, { status: 403 })
    }

    const { email } = await request.json()
    if (!email?.trim()) {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalised = email.trim().toLowerCase()
    const customers = await stripe.customers.list({ email: normalised, limit: 5 })

    let customerId: string | null = null
    outer: for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 10,
      })
      for (const sub of subs.data) {
        for (const item of sub.items.data) {
          if (item.price.id === process.env.STRIPE_PRICE_ID) {
            customerId = customer.id
            break outer
          }
        }
      }
    }

    if (!customerId) {
      return Response.json(
        { error: 'No active Pro subscription found for that email.' },
        { status: 404 },
      )
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://hypectr.com'}/`,
    })

    return Response.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to open portal'
    return Response.json({ error: message }, { status: 500 })
  }
}
