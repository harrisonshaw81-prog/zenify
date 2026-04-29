import { createHmac } from 'crypto'

const SECRET = process.env.COOKIE_SECRET!
export const COOKIE_NAME = 'zenify_pro'
const EXPIRY_DAYS = 30

export function signProCookie(): string {
  const expires = Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000
  const payload = String(expires)
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex')
  return `${payload}.${sig}`
}

export function verifyProCookie(value: string | undefined): boolean {
  if (!value) return false
  const [payload, sig] = value.split('.')
  if (!payload || !sig) return false
  const expected = createHmac('sha256', SECRET).update(payload).digest('hex')
  if (expected !== sig) return false
  return Date.now() < parseInt(payload, 10)
}
