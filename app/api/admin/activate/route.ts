import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/pro-cookie'

const LIFETIME_TOKEN = '4931630466677.9c1c4d5e515a5824c134b92fdd8e17d9f42e919c393226234e6e4d995d6fae17'

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/?pro=1', req.url))
  res.cookies.set(COOKIE_NAME, LIFETIME_TOKEN, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365 * 100,
    path: '/',
  })
  return res
}
