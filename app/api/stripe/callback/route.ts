import Stripe from 'stripe'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { signProCookie, COOKIE_NAME } from '@/lib/pro-cookie'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) redirect('/?error=missing_session')

  let session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId!)
  } catch {
    redirect('/?error=missing_session')
  }

  if (session.payment_status !== 'paid' && session.status !== 'complete') {
    redirect('/?error=payment_incomplete')
  }

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, signProCookie(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  })

  redirect('/?pro=1')
}
