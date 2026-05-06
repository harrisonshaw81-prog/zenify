import { createHmac } from 'crypto'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const env = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
const secret = env.match(/^COOKIE_SECRET=(.+)$/m)?.[1]?.trim()
if (!secret) { console.error('COOKIE_SECRET not found in .env.local'); process.exit(1) }

const lifetime = process.argv.includes('--lifetime')
const days = lifetime ? 365 * 100 : 30
const expires = Date.now() + days * 24 * 60 * 60 * 1000
const payload = String(expires)
const sig = createHmac('sha256', secret).update(payload).digest('hex')
const value = `${payload}.${sig}`

console.log('\nCookie name:  hypectr_pro')
console.log('Cookie value:', value)
console.log('\nPaste this in DevTools → Application → Cookies → hypectr.com')
console.log('Expires:', new Date(expires).toLocaleString(), lifetime ? '(lifetime)' : '', '\n')
