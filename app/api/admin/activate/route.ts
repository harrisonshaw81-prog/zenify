import { NextRequest, NextResponse } from 'next/server'
import { signProCookie, COOKIE_NAME } from '@/lib/pro-cookie'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (token !== process.env.ADMIN_TOKEN) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const value = signProCookie()
  const res = NextResponse.redirect(new URL('/?pro=1', req.url))
  res.cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365 * 100,
    path: '/',
  })
  return res
}
