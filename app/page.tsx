import { cookies } from 'next/headers'
import { verifyProCookie, COOKIE_NAME } from '@/lib/pro-cookie'
import Analyzer from '@/components/Analyzer'
import CheckoutButton from '@/components/CheckoutButton'
import StarBackground from '@/components/ui/star-background'
import { TiltCard } from '@/components/ui/tilt-card'
import RestoreAccessButton from '@/components/RestoreAccessButton'
import ProductMockup from '@/components/ui/product-mockup'
import AnalyzerCard from '@/components/AnalyzerCard'

export default async function Home() {
  const cookieStore = await cookies()
  const isPro = verifyProCookie(cookieStore.get(COOKIE_NAME)?.value)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', position: 'relative' }}>
      <StarBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <Navbar isPro={isPro} />
      <Hero isPro={isPro} />
      <AnalyzerSection isPro={isPro} />
      <PainPoints />
      <Features />
      <HowItWorks />
      <Testimonials />
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
    <section style={{ position: 'relative', overflow: 'hidden', paddingTop: 80, paddingBottom: 80 }}>
      <div style={{
        position: 'absolute', top: -100, left: '30%', transform: 'translateX(-50%)',
        width: 700, height: 500,
        background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        maxWidth: 1120, margin: '0 auto', padding: '0 24px',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 64, alignItems: 'center',
      }}>
        {/* Left: copy only */}
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
            borderRadius: 999, border: '1px solid var(--border)', background: 'var(--surface)',
            fontSize: 13, fontWeight: 500, color: 'var(--accent-light)', marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            {isPro ? '✓ Pro - Full Access' : 'Intelligent Channel Analysis'}
          </div>
          <h1 style={{
            fontSize: 'clamp(34px, 4vw, 58px)', fontWeight: 800, lineHeight: 1.1,
            letterSpacing: '-2px', marginBottom: 20,
          }}>
            Turn Channel Data Into{' '}
            <span style={{ color: 'var(--accent)' }}>Viral Video Ideas</span>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.7, fontWeight: 400 }}>
            Paste any YouTube channel URL. Zenify analyses your top-performing videos and delivers 5 ranked ideas with performance predictions - complete with AI-generated thumbnails.
          </p>
          <div style={{ display: 'flex', gap: 36, marginTop: 32, flexWrap: 'wrap' }}>
            {([['12,000+', 'channels analysed'], ['60,000+', 'ideas generated'], ['1,200+', 'creators trust Zenify']] as const).map(([val, label]) => (
              <div key={label}>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>{val}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 3D product mockup */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <ProductMockup />
        </div>
      </div>

      {/* Mobile stack override */}
      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-mockup { display: none !important; }
        }
      `}</style>
    </section>
  )
}

function AnalyzerSection({ isPro }: { isPro: boolean }) {
  return (
    <section id="analyzer" style={{ padding: '0 24px 100px', position: 'relative' }}>
      {/* Spotlight glow behind the box */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800, height: 400,
        background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.13) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <AnalyzerCard>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px',
            borderRadius: 999, border: '1px solid rgba(139,92,246,0.3)',
            background: 'rgba(139,92,246,0.08)', fontSize: 12, fontWeight: 600,
            color: 'var(--accent-light)', marginBottom: 14, letterSpacing: '0.3px',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', boxShadow: '0 0 6px var(--accent)' }} />
            Try it free - no account needed
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 8 }}>
            Analyze any YouTube channel
          </h2>
          <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.6 }}>
            Paste a channel URL below and get 5 ranked video ideas in seconds.
          </p>
        </div>

        <Analyzer isPro={isPro} />
      </AnalyzerCard>
    </section>
  )
}

function Features() {
  const items = [
    {
      icon: '📊',
      title: 'Deep Channel Analysis',
      desc: 'Fetches your top-performing videos and extracts the patterns - view velocity, engagement rates, topic clusters - that actually drive growth.',
    },
    {
      icon: '⚡',
      title: 'Precision Video Ideas',
      desc: "5 ranked ideas calibrated to your channel's winning formula. Each one is scored by predicted performance, not guesswork.",
    },
    {
      icon: '🖼️',
      title: 'AI Thumbnail Concepts',
      desc: 'Every idea ships with an AI-generated thumbnail so you can go straight from idea to production without a separate brief.',
    },
  ]

  return (
    <section id="features" style={{ padding: '80px 24px', maxWidth: 1120, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600, marginBottom: 12, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
          We built the fix
        </p>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>
          Everything you need to grow faster
        </h2>
        <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 480, margin: '0 auto' }}>
          Stop guessing what to post. Let data do the thinking.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {items.map(({ icon, title, desc }) => (
          <TiltCard key={title} className="feature-card" tiltLimit={8} scale={1.02}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>{icon}</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{title}</h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{desc}</p>
          </TiltCard>
        ))}
      </div>
    </section>
  )
}

function PainPoints() {
  const pains = [
    { icon: '🧊', title: 'Creative block', desc: "You open a doc to plan next week's video. An hour later it's still blank." },
    { icon: '🎲', title: 'Posting feels like gambling', desc: "You have no idea if this topic will land or disappear into the void." },
    { icon: '⏱️', title: 'Hours lost to research', desc: "Deep in spreadsheets and competitor channels every single week." },
    { icon: '📉', title: "You don't know what made the hits", desc: "Your best video blew up - but you couldn't replicate it if you tried." },
  ]

  return (
    <section style={{ padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px',
            borderRadius: 999, border: '1px solid var(--border)', background: 'var(--surface)',
            fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 18,
          }}>
            Sound familiar?
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>
            Every creator hits these walls
          </h2>
          <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 480, margin: '0 auto' }}>
            Zenify was built to fix these exact problems - not paper over them.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {pains.map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '24px 24px 22px',
            }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      n: '01',
      icon: '🔗',
      title: 'Paste a Channel URL',
      desc: 'Drop in any YouTube channel URL - works with @handles, /channel/ IDs, and custom URLs.',
    },
    {
      n: '02',
      icon: '🔍',
      title: 'We Analyse Top Videos',
      desc: "Zenify pulls your top-performing videos via the YouTube Data API and decodes the patterns that drive views.",
    },
    {
      n: '03',
      icon: '🚀',
      title: 'Get 5 Ranked Ideas',
      desc: '5 video ideas ranked by predicted performance - each with a title, thumbnail concept, and the reason it will win.',
    },
  ]

  return (
    <section id="how-it-works" style={{ padding: '100px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes stepFadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      {/* bg glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 400, background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px',
            borderRadius: 999, border: '1px solid var(--border)', background: 'var(--surface)',
            fontSize: 12, fontWeight: 600, color: 'var(--accent-light)', marginBottom: 18, letterSpacing: '0.3px',
          }}>
            Three steps. Thirty seconds.
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px' }}>How it works</h2>
        </div>

        {/* Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, position: 'relative' }}>
          {/* Connector line between steps */}
          <div style={{
            position: 'absolute', top: 26, left: 'calc(16.67% + 26px)', right: 'calc(16.67% + 26px)',
            height: 1, background: 'linear-gradient(to right, rgba(139,92,246,0.5), rgba(139,92,246,0.5))',
            zIndex: 0,
          }} />
          {steps.map((step) => (
            <div key={step.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, marginBottom: 20, flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(9,9,15,0.95))',
                border: '1px solid rgba(139,92,246,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, zIndex: 1, position: 'relative',
                boxShadow: '0 0 20px rgba(139,92,246,0.15)',
              }}>
                {step.icon}
              </div>
              <div style={{
                fontSize: 11, fontWeight: 700, color: 'var(--accent)',
                letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10, opacity: 0.7,
              }}>
                Step {step.n}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.3px' }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

type TCard = {
  type: 'face' | 'logo'
  avatar: string
  avatarBg: string
  name: string
  handle: string
  subs: string
  quote: string
}

function TestimonialCard({ t }: { t: TCard }) {
  return (
    <div style={{
      width: 300, flexShrink: 0,
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 16, padding: '20px 22px',
    }}>
      <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, margin: '0 0 16px' }}>
        &ldquo;{t.quote}&rdquo;
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 38, height: 38, flexShrink: 0,
          background: t.avatarBg,
          borderRadius: t.type === 'face' ? '50%' : 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: t.type === 'face' ? 22 : 13,
          fontWeight: t.type === 'logo' ? 700 : 400,
          color: 'white',
        }}>
          {t.avatar}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{t.handle} · {t.subs}</div>
        </div>
      </div>
    </div>
  )
}

function Testimonials() {
  const all: TCard[] = [
    { type: 'face', avatar: '🧑🏻', avatarBg: '#1e1042', name: 'Marcus R.', handle: '@marcusbuilds', subs: '84K subs', quote: "Zenify gave me 5 ideas in 30 seconds that would've taken me an afternoon. Three hit the top 10% of my channel." },
    { type: 'logo', avatar: 'SL', avatarBg: '#0d9488', name: 'Sophie L.', handle: '@sophielearns', subs: '210K subs', quote: "The thumbnail concepts alone are worth it. Paste the output to my designer and we're done in minutes." },
    { type: 'face', avatar: '👨🏾', avatarBg: '#0c2340', name: 'James T.', handle: '@jamestechreviews', subs: '47K subs', quote: "The analysis picked up a hook pattern in my top videos I hadn't noticed myself. Immediately actionable." },
    { type: 'logo', avatar: 'CM', avatarBg: '#f97316', name: 'Chris M.', handle: '@chrismoneytalks', subs: '156K subs', quote: "The ranked list is the best part. I know exactly which idea to execute first, no second-guessing." },
    { type: 'face', avatar: '👩🏽', avatarBg: '#2a0e1f', name: 'Aisha N.', handle: '@aishalifts', subs: '22K subs', quote: "My last three videos all hit 50K+ views. Zenify changed the way I approach content planning entirely." },
    { type: 'logo', avatar: 'TB', avatarBg: '#3b82f6', name: 'Tom B.', handle: '@tombuildsstuff', subs: '89K subs', quote: "I run it every Monday before planning the week. The workflow difference is massive." },
    { type: 'face', avatar: '👩🏻', avatarBg: '#1a1535', name: 'Lena S.', handle: '@lenastudio', subs: '44K subs', quote: "It found my hook formula before I did. That pattern recognition alone is worth the subscription." },
    { type: 'logo', avatar: 'RJ', avatarBg: '#be185d', name: 'Ryan J.', handle: '@ryanjourneys', subs: '302K subs', quote: "Saved me 3 hours of research per video. I tracked it. That's not marketing copy." },
    { type: 'face', avatar: '🧑🏽', avatarBg: '#0f2818', name: 'Priya K.', handle: '@priyacooks', subs: '31K subs', quote: "Went from posting once a month to twice a week. The ideas never dry up with Zenify." },
    { type: 'logo', avatar: 'MW', avatarBg: '#7c3aed', name: 'Mei W.', handle: '@meiwanders', subs: '18K subs', quote: "As a new creator this gave me a roadmap I didn't know I needed. Wish I'd found it sooner." },
    { type: 'face', avatar: '👨🏻', avatarBg: '#1e1042', name: 'David P.', handle: '@davidspreneur', subs: '67K subs', quote: "I've tried other tools. None of them go this deep on actual channel data." },
    { type: 'logo', avatar: 'ZH', avatarBg: '#0f766e', name: 'Zara H.', handle: '@zarahealthtips', subs: '129K subs', quote: "The performance predictions are scary accurate. I trust them more than my own instincts now." },
    { type: 'face', avatar: '🧑🏿', avatarBg: '#0c2340', name: 'Noah C.', handle: '@noahcodes', subs: '11K subs', quote: "Worth every dollar just for the thumbnail concepts. I'd honestly pay twice." },
    { type: 'logo', avatar: 'EB', avatarBg: '#b45309', name: 'Elena B.', handle: '@elenabeauty', subs: '241K subs', quote: "Zenify helped me find a niche angle I'd completely overlooked in my own channel for two years." },
    { type: 'face', avatar: '👨🏽', avatarBg: '#2a0e1f', name: 'Sam K.', handle: '@samkitchen', subs: '78K subs', quote: "I analyze every channel I admire. It's like reverse-engineering success at scale." },
    { type: 'logo', avatar: 'FO', avatarBg: '#991b1b', name: 'Fatima O.', handle: '@fatimafit', subs: '35K subs', quote: "Went from 3K to 35K in 6 months. I credit Zenify for finding the content gaps I was missing." },
    { type: 'face', avatar: '👩🏾', avatarBg: '#1a1535', name: 'Luke T.', handle: '@luketravels', subs: '93K subs', quote: "The time savings alone justify the subscription. The results are just a bonus." },
    { type: 'logo', avatar: 'AJ', avatarBg: '#4338ca', name: 'Amara J.', handle: '@amarajournals', subs: '56K subs', quote: "My editor asks why my briefs have gotten so much better. I just smile." },
    { type: 'face', avatar: '🧑🏼', avatarBg: '#0f2818', name: 'Ben R.', handle: '@benreviews', subs: '188K subs', quote: "Five ranked ideas with scoring logic. No decision fatigue. Just execute." },
    { type: 'logo', avatar: 'YM', avatarBg: '#065f46', name: 'Yuki M.', handle: '@yukiminimalist', subs: '29K subs', quote: "Sent this to every creator I know. That's the best testimonial I can give." },
  ]

  const row1 = all.slice(0, 10)
  const row2 = all.slice(10)

  return (
    <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)', overflow: 'hidden' }}>
      <style>{`
        @keyframes scrollLeft  { from { transform: translateX(0); }    to { transform: translateX(-50%); } }
        @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0); }    }
        .t-track { display: flex; gap: 16px; width: max-content; }
        .t-left  { animation: scrollLeft  55s linear infinite; }
        .t-right { animation: scrollRight 50s linear infinite; }
        .t-track:hover { animation-play-state: paused; }
      `}</style>
      <div style={{ textAlign: 'center', marginBottom: 56, padding: '0 24px' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>
          Creators are growing with Zenify
        </h2>
        <p style={{ fontSize: 17, color: 'var(--muted)' }}>
          Join 1,200+ creators who use data to build smarter strategies.
        </p>
      </div>
      <div style={{
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
      }}>
        <div style={{ marginBottom: 16 }}>
          <div className="t-track t-left">
            {[...row1, ...row1].map((t, i) => <TestimonialCard key={i} t={t} />)}
          </div>
        </div>
        <div>
          <div className="t-track t-right">
            {[...row2, ...row2].map((t, i) => <TestimonialCard key={i} t={t} />)}
          </div>
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
          features={['3 analyses per day', '1 ranked idea per analysis', 'Title + performance reason', 'YouTube data insights']}
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
        <a href="#analyzer" style={{
          display: 'block', width: '100%', padding: '13px 0', borderRadius: 10, fontWeight: 700, fontSize: 15,
          background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)',
          cursor: 'pointer', textAlign: 'center', textDecoration: 'none',
        }}>
          {cta}
        </a>
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
