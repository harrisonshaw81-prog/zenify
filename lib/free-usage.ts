import { createHmac } from 'crypto'

const SECRET = process.env.COOKIE_SECRET!
export const FREE_COOKIE_NAME = 'zenify_free'
export const FREE_DAILY_LIMIT = 3

export function signFreeCookie(count: number, day: string): string {
  const payload = `${day}:${count}`
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex')
  return `${payload}:${sig}`
}

export function verifyFreeCookie(value: string | undefined): { count: number; day: string } | null {
  if (!value) return null
  const [day, countStr, sig] = value.split(':')
  if (!day || !countStr || !sig) return null
  const count = parseInt(countStr, 10)
  if (isNaN(count)) return null
  const expected = createHmac('sha256', SECRET).update(`${day}:${count}`).digest('hex')
  if (expected !== sig) return null
  return { count, day }
}
