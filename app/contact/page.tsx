import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Contact - HypeCTR' }

export default function ContactPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', padding: '80px 24px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
        <Link href="/" style={{ color: 'var(--accent)', fontSize: 14, textDecoration: 'none', display: 'inline-block', marginBottom: 40 }}>
          ← Back to HypeCTR
        </Link>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>Get in touch</h1>
        <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 40 }}>
          Have a question, issue, or feedback? We&apos;d love to hear from you.
        </p>
        <a
          href="mailto:support@hypectr.com"
          style={{
            display: 'inline-block', background: 'var(--accent)', color: 'var(--bg)',
            fontWeight: 700, fontSize: 15, padding: '13px 32px', borderRadius: 10,
            textDecoration: 'none',
          }}
        >
          Email support@hypectr.com
        </a>
      </div>
    </div>
  )
}
