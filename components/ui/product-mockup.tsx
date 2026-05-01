'use client'

import { useState, useEffect } from 'react'

const ACCENT = '#8b5cf6'
const ACCENT_DIM = 'rgba(139,92,246,0.15)'
const BORDER = 'rgba(255,255,255,0.08)'
const MUTED = 'rgba(255,255,255,0.4)'
const SURFACE = 'rgba(255,255,255,0.04)'

function BrowserChrome() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 14px', borderBottom: `1px solid ${BORDER}`,
      background: 'rgba(255,255,255,0.03)',
    }}>
      <div style={{ display: 'flex', gap: 5 }}>
        {['#ff5f57','#febc2e','#28c840'].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.9 }} />
        ))}
      </div>
      <div style={{
        flex: 1, height: 22, borderRadius: 6, background: SURFACE,
        border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center',
        paddingLeft: 10, gap: 6,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, opacity: 0.7 }} />
        <span style={{ fontSize: 10, color: MUTED, fontFamily: 'monospace' }}>hypectr.com</span>
      </div>
    </div>
  )
}

function Scene0() {
  return (
    <div style={{ padding: '28px 24px' }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.3px', marginBottom: 6 }}>
          Hype<span style={{ color: ACCENT }}>CTR</span>
        </div>
        <div style={{ fontSize: 11, color: MUTED }}>Paste any YouTube channel URL</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <div style={{
          flex: 1, height: 36, borderRadius: 8, background: SURFACE,
          border: `1px solid ${ACCENT}`, display: 'flex', alignItems: 'center',
          paddingLeft: 12,
        }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
            youtube.com/@yourchannel
          </span>
          <span style={{
            width: 1, height: 14, background: ACCENT,
            marginLeft: 2, animation: 'blink 1s step-end infinite',
          }} />
        </div>
        <div style={{
          padding: '0 14px', borderRadius: 8, background: ACCENT,
          display: 'flex', alignItems: 'center',
          fontSize: 10, fontWeight: 700, color: '#09090f', whiteSpace: 'nowrap',
        }}>
          Analyze
        </div>
      </div>
      <div style={{ fontSize: 10, color: MUTED, textAlign: 'center' }}>
        No account required · Any public channel
      </div>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  )
}

function Scene1() {
  return (
    <div style={{ padding: '28px 24px' }}>
      <div style={{
        background: SURFACE, border: `1px solid ${BORDER}`,
        borderRadius: 10, padding: '14px 16px', marginBottom: 16,
      }}>
        <div style={{ fontSize: 9, color: MUTED, marginBottom: 4 }}>Analyzing</div>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>YourChannel</div>
        <div style={{ fontSize: 9, color: MUTED }}>10.8M subscribers · 487 videos analyzed</div>
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          height: 52, borderRadius: 8, background: SURFACE,
          border: `1px solid ${BORDER}`, marginBottom: 8,
          overflow: 'hidden', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(90deg, transparent, rgba(139,92,246,0.08), transparent)`,
            animation: `shimmer 1.4s ease-in-out ${i * 0.2}s infinite`,
          }} />
        </div>
      ))}
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: MUTED }}>Fetching top videos and generating ideas…</span>
      </div>
      <style>{`@keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }`}</style>
    </div>
  )
}

function Scene2() {
  const ideas = [
    { rank: 1, title: 'I Bought Every Car at This Junkyard', hot: true },
    { rank: 2, title: 'Teaching My Truck to Fly (Gone Wrong)' },
    { rank: 3, title: 'What Happens When You Fill a Truck with Concrete' },
  ]
  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: 9, color: MUTED, marginBottom: 12 }}>
        5 ranked ideas · YourChannel
      </div>
      {ideas.map((idea) => (
        <div key={idea.rank} style={{
          background: idea.hot ? ACCENT_DIM : SURFACE,
          border: `1px solid ${idea.hot ? ACCENT : BORDER}`,
          borderRadius: 8, padding: '10px 12px', marginBottom: 7,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            minWidth: 20, height: 20, borderRadius: 5,
            background: idea.hot ? ACCENT : SURFACE,
            color: idea.hot ? '#09090f' : MUTED,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, fontWeight: 800,
          }}>#{idea.rank}</span>
          <span style={{ fontSize: 9.5, fontWeight: 600, lineHeight: 1.4, color: idea.hot ? '#fff' : 'rgba(255,255,255,0.8)' }}>
            {idea.title}
          </span>
        </div>
      ))}
      <div style={{
        height: 28, borderRadius: 8, background: SURFACE,
        border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 4,
      }}>
        <span style={{ fontSize: 8, color: MUTED }}>🔒</span>
        <span style={{ fontSize: 8, color: MUTED }}>2 more ideas - upgrade to Pro</span>
      </div>
    </div>
  )
}

function Scene3() {
  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{
        background: ACCENT_DIM, border: `1px solid ${ACCENT}`,
        borderRadius: 8, padding: '10px 12px', marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{
            minWidth: 20, height: 20, borderRadius: 5, background: ACCENT,
            color: '#09090f', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, fontWeight: 800,
          }}>#1</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: ACCENT, letterSpacing: '0.5px' }}>TOP PICK</span>
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 6 }}>
          I Bought Every Car at This Junkyard
        </div>
        <div style={{ fontSize: 8, color: MUTED, lineHeight: 1.5, marginBottom: 10 }}>
          Matches your top pattern - destruction + extreme scale drives 4.2× avg views on this channel.
        </div>
        <div style={{
          borderRadius: 6, overflow: 'hidden',
          background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 40%, #0f1a2e 100%)',
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', border: `1px solid rgba(139,92,246,0.3)`,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 30% 50%, rgba(139,92,246,0.3), transparent 60%)',
          }} />
          <span style={{
            fontSize: 9, fontWeight: 800, color: '#fff', textAlign: 'center',
            textShadow: '0 0 20px rgba(139,92,246,0.8)', padding: '0 8px', position: 'relative',
          }}>
            I BOUGHT EVERY CAR<br />AT THIS JUNKYARD
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <span style={{ fontSize: 9, color: MUTED }}>Generated thumbnail</span>
        <span style={{ fontSize: 9, color: ACCENT, fontWeight: 600, cursor: 'pointer' }}>↓ Download</span>
      </div>
    </div>
  )
}

const SCENES = [Scene0, Scene1, Scene2, Scene3]

export default function ProductMockup() {
  const [current, setCurrent] = useState(0)
  const [next, setNext] = useState<number | null>(null)
  const [sliding, setSliding] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      const nextIndex = (current + 1) % SCENES.length
      setNext(nextIndex)
      setSliding(true)
      setTimeout(() => {
        setCurrent(nextIndex)
        setNext(null)
        setSliding(false)
      }, 480)
    }, 4000)
    return () => clearInterval(id)
  }, [current])

  const CurrentScene = SCENES[current]
  const NextScene = next !== null ? SCENES[next] : null

  return (
    <div style={{ perspective: '1100px', width: '100%', maxWidth: 420 }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 340, height: 340,
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.22) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Window — always at constant tilt, content slides inside */}
      <div style={{
        position: 'relative', zIndex: 1,
        transform: 'rotateY(-8deg) rotateX(10deg)',
        transformStyle: 'preserve-3d',
        background: 'rgba(12,10,20,0.92)',
        border: `1px solid ${BORDER}`,
        borderRadius: 14,
        boxShadow: `0 0 0 1px rgba(139,92,246,0.2), 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(139,92,246,0.12)`,
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
        animation: 'float 5s ease-in-out infinite',
      }}>
        <BrowserChrome />

        {/* Sliding content area — fixed height so window never resizes */}
        <div style={{ position: 'relative', overflow: 'hidden', height: 260 }}>
          {/* Current scene — slides out to left */}
          <div style={{
            transform: sliding ? 'translateX(-100%)' : 'translateX(0%)',
            transition: sliding ? 'transform 0.48s cubic-bezier(0.4,0,0.2,1)' : 'none',
          }}>
            <CurrentScene />
          </div>

          {/* Next scene — slides in from right */}
          {NextScene && (
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%',
              transform: sliding ? 'translateX(0%)' : 'translateX(100%)',
              transition: sliding ? 'transform 0.48s cubic-bezier(0.4,0,0.2,1)' : 'none',
            }}>
              <NextScene />
            </div>
          )}
        </div>
      </div>


      <style>{`
        @keyframes float {
          0%, 100% { transform: rotateY(-8deg) rotateX(10deg) translateY(0px); }
          50% { transform: rotateY(-8deg) rotateX(10deg) translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
