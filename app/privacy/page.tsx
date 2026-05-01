import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Privacy Policy - HypeCTR' }

export default function PrivacyPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', padding: '80px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/" style={{ color: 'var(--accent)', fontSize: 14, textDecoration: 'none', display: 'inline-block', marginBottom: 40 }}>
          ← Back to HypeCTR
        </Link>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 48 }}>Last updated: May 2026</p>

        <Section title="Information We Collect">
          We collect the YouTube channel URLs you submit for analysis. We do not require you to create an account. Free-tier usage is tracked via a signed cookie stored in your browser — this cookie contains only your daily analysis count and cannot be used to identify you personally.
        </Section>

        <Section title="How We Use Your Data">
          Channel URLs are used solely to fetch publicly available YouTube data via the YouTube Data API and generate video ideas on your behalf. We do not store your analysis results or channel URLs after the request is complete.
        </Section>

        <Section title="Third-Party Services">
          HypeCTR uses the following third-party services: YouTube Data API v3 (Google LLC), Anthropic API for AI-generated content, Google Gemini API for thumbnail generation, and Stripe for payment processing. Each service has its own privacy policy.
        </Section>

        <Section title="Cookies">
          We use a single server-set cookie to track free-tier usage limits. Pro subscribers receive an additional signed cookie to verify their subscription status. Neither cookie contains personally identifiable information.
        </Section>

        <Section title="Payments">
          Payments are processed by Stripe. We do not store credit card details. Stripe&apos;s privacy policy governs the handling of payment information.
        </Section>

        <Section title="Contact">
          For privacy-related questions, please visit our <Link href="/contact" style={{ color: 'var(--accent)' }}>contact page</Link>.
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.3px' }}>{title}</h2>
      <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.8 }}>{children}</p>
    </div>
  )
}
