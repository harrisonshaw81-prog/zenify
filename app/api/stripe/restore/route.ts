import Stripe from 'stripe'
import { cookies } from 'next/headers'
import { signProCookie, COOKIE_NAME } from '@/lib/pro-cookie'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email?.trim()) {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalised = email.trim().toLowerCase()
    const customers = await stripe.customers.list({ email: normalised, limit: 5 })

    let found = false
    outer: for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 10,
      })
      for (const sub of subs.data) {
        for (const item of sub.items.data) {
          if (item.price.id === process.env.STRIPE_PRICE_ID) {
            found = true
            break outer
          }
        }
      }
    }

    if (!found) {
      return Response.json(
        { error: 'No active Pro subscription found for that email.' },
        { status: 404 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, signProCookie(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })

    return Response.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Restore failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
