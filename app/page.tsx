import { cookies } from 'next/headers'
import { verifyProCookie, COOKIE_NAME } from '@/lib/pro-cookie'
import Analyzer from '@/components/Analyzer'
import CheckoutButton from '@/components/CheckoutButton'
import StarBackground from '@/components/ui/star-background'
import { TiltCard } from '@/components/ui/tilt-card'
import RestoreAccessButton from '@/components/RestoreAccessButton'

export default async function Home() {
  const cookieStore = await cookies()
  const isPro = verifyProCookie(cookieStore.get(COOKIE_NAME)?.value)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', position: 'relative' }}>
      <StarBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <Navbar isPro={isPro} />
      <Hero isPro={isPro} />
      <Features />
      <HowItWorks />
      <Pricing isPro={isPro} />
      <CtaBanner />
      <Footer />
      </div>
    </div>
  )
}

function Navbar({ isPro }: { isPro: boolean }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(12px)',
      background: 'rgba(9,9,15,0.85)',
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Zen<span style={{ color: 'var(--accent)' }}>ify</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How it Works</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          {!isPro && <RestoreAccessButton />}
          {!isPro && <CheckoutButton style={{
            fontSize: 14, fontWeight: 600, color: 'var(--bg)', background: 'var(--accent)',
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }} />}
        </div>
      </div>
    </nav>
  )
}

function Hero({ isPro }: { isPro: boolean }) {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', paddingTop: 100, paddingBottom: 80, textAlign: 'center' }}>
      <div style={{
        position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 500,
        background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
          borderRadius: 999, border: '1px solid var(--border)', background: 'var(--surface)',
          fontSize: 13, fontWeight: 500, color: 'var(--accent-light)', marginBottom: 28,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          {isPro ? '✓ Pro — Full Access' : 'Intelligent Channel Analysis'}
        </div>
        <h1 style={{
          fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 800, lineHeight: 1.1,
          letterSpacing: '-2px', marginBottom: 24,
        }}>
          Turn Channel Data Into<br />
          <span style={{ color: 'var(--accent)' }}>Viral Video Ideas</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 48px', fontWeight: 400 }}>
          Paste any YouTube channel URL. Zenify deep-analyses your top-performing videos and delivers 5 ranked ideas with performance predictions — complete with titles and thumbnail concepts.
        </p>
        <Analyzer isPro={isPro} />
      </div>
    </section>
  )
}

function Features() {
  const items = [
    {
      icon: '📊',
      title: 'Deep Channel Analysis',
      desc: 'Zenify fetches your top-performing videos, extracts view counts, engagement rates, and content patterns to understand what resonates with your audience.',
    },
    {
      icon: '⚡',
      title: 'Precision Video Ideas',
      desc: "Zenify decodes your channel's winning formula and generates 5 ranked video ideas — each one calibrated to replicate your top performers.",
    },
    {
      icon: '🖼️',
      title: 'Thumbnail Concepts',
      desc: 'Every idea comes with a detailed thumbnail concept so you can brief your designer or create it yourself with confidence.',
    },
  ]

  return (
    <section id="features" style={{ padding: '80px 24px', maxWidth: 1120, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>
          Everything you need to grow faster
        </h2>
        <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 480, margin: '0 auto' }}>
          Stop guessing what to post. Let data do the thinking.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {items.map(item => (
          <TiltCard key={item.title} className="feature-card" tiltLimit={8} scale={1.02}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{item.desc}</p>
          </TiltCard>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { n: '01', title: 'Paste a Channel URL', desc: 'Drop in any YouTube channel URL — works with @handles, /channel/ IDs, and custom URLs.' },
    { n: '02', title: 'We Analyze Top Videos', desc: 'Zenify pulls your top-performing videos via the YouTube Data API and identifies the patterns that drive views.' },
    { n: '03', title: 'Get 5 Ranked Ideas', desc: 'Zenify generates 5 video ideas ranked by predicted performance — each with a title and thumbnail concept ready to use.' },
  ]

  return (
    <section id="how-it-works" style={{ padding: '80px 24px', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>How it works</h2>
          <p style={{ fontSize: 17, color: 'var(--muted)' }}>Three steps. Thirty seconds.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
          {steps.map(step => (
            <div key={step.n} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{
                minWidth: 44, height: 44, borderRadius: 12, background: 'var(--card)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.5px',
              }}>
                {step.n}
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing({ isPro }: { isPro: boolean }) {
  return (
    <section id="pricing" style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>Simple pricing</h2>
        <p style={{ fontSize: 17, color: 'var(--muted)' }}>Start free. Upgrade when you're ready.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        <PricingCard
          name="Free"
          price="$0"
          period=""
          description="Try Zenify on any channel"
          features={['1 result per analysis (out of 5)', 'Title + thumbnail concept', 'Unlimited channel analyses', 'YouTube data insights']}
          cta="Start for free"
          accent={false}
        />
        <PricingCard
          name="Pro"
          price="$19"
          period="/month"
          description="Full access for serious creators"
          features={['All 5 ranked video ideas', 'Full titles + thumbnail concepts', 'Performance prediction reasoning', 'Unlimited channel analyses', 'Priority support']}
          cta="Get Pro"
          accent={true}
        />
      </div>
      {!isPro && (
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
            Already subscribed? Restore your access below.
          </p>
          <RestoreAccessButton />
        </div>
      )}
    </section>
  )
}

function PricingCard({ name, price, period, description, features, cta, accent }: {
  name: string; price: string; period: string; description: string;
  features: string[]; cta: string; accent: boolean;
}) {
  return (
    <div style={{
      background: accent ? 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, var(--card) 100%)' : 'var(--card)',
      border: `1px solid ${accent ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 20, padding: '36px 32px', position: 'relative',
    }}>
      {accent && (
        <div style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--accent)', color: 'var(--bg)', fontSize: 11, fontWeight: 700,
          padding: '4px 14px', borderRadius: 999, letterSpacing: '0.5px', whiteSpace: 'nowrap',
        }}>
          MOST POPULAR
        </div>
      )}
      <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
        <span style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px' }}>{price}</span>
        <span style={{ fontSize: 16, color: 'var(--muted)' }}>{period}</span>
      </div>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>{description}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <span style={{ color: 'var(--accent)', fontSize: 16 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      {accent ? (
        <CheckoutButton style={{
          width: '100%', padding: '13px 0', borderRadius: 10, fontWeight: 700, fontSize: 15,
          background: 'var(--accent)', color: 'var(--bg)', border: '1px solid var(--accent)',
          cursor: 'pointer', fontFamily: 'inherit',
        }} />
      ) : (
        <button style={{
          width: '100%', padding: '13px 0', borderRadius: 10, fontWeight: 700, fontSize: 15,
          background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)',
          cursor: 'pointer',
        }}>
          {cta}
        </button>
      )}
    </div>
  )
}

function CtaBanner() {
  return (
    <section style={{ padding: '80px 24px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>
          Ready to grow your channel?
        </h2>
        <p style={{ fontSize: 17, color: 'var(--muted)', marginBottom: 36 }}>
          Join creators who use Zenify to build smarter content strategies.
        </p>
        <CheckoutButton style={{
          background: 'var(--accent)', color: 'var(--bg)', border: 'none',
          fontWeight: 700, fontSize: 16, padding: '14px 36px', borderRadius: 10,
          cursor: 'pointer', fontFamily: 'inherit',
        }} />
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Zen<span style={{ color: 'var(--accent)' }}>ify</span>
        </span>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>© 2025 Zenify. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Contact'].map(link => (
            <a key={link} href="#" className="footer-link">{link}</a>
          ))}
        </div>
      </div>
    </footer>
  )
}
