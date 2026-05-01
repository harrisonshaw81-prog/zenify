import { createHmac } from 'crypto'

const SECRET = process.env.COOKIE_SECRET!
export const THUMB_COOKIE_NAME = 'hypectr_thumbs'
export const THUMB_MONTHLY_LIMIT = 25

export function signThumbCookie(count: number, month: string): string {
  const payload = `${month}:${count}`
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex')
  return `${payload}:${sig}`
}

// Cookie format: "YYYY-MM:count:sig" — splits into exactly 3 parts on ":"
// e.g. "2026-05:3:abc123"
export function verifyThumbCookie(value: string | undefined): { count: number; month: string } | null {
  if (!value) return null
  const firstColon = value.indexOf(':')
  const lastColon = value.lastIndexOf(':')
  if (firstColon === -1 || firstColon === lastColon) return null
  const month = value.slice(0, firstColon)
  const countStr = value.slice(firstColon + 1, lastColon)
  const sig = value.slice(lastColon + 1)
  const count = parseInt(countStr, 10)
  if (isNaN(count)) return null
  const expected = createHmac('sha256', SECRET).update(`${month}:${count}`).digest('hex')
  if (expected !== sig) return null
  return { count, month }
}
