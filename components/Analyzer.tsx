'use client'

import { useState, useEffect } from 'react'
import CheckoutButton from './CheckoutButton'
import { TiltCard } from './ui/tilt-card'

interface VideoIdea {
  title: string
  performanceReason: string
  thumbnailConcept: string
  rank: number
}

interface AnalysisResult {
  channelName: string
  subscriberCount: string
  totalVideosAnalyzed: number
  channelAvatar?: string
  faceRefs?: string[]
  thumbnailStyle?: string
  ideas: VideoIdea[]
}

export default function Analyzer({ isPro = false }: { isPro?: boolean }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [msgIdx, setMsgIdx] = useState(0)

  const spinnerMessages = [
    'Fetching top videos…',
    'Identifying winning patterns…',
    'Crafting your viral blueprint…',
    'Ranking ideas by predicted performance…',
  ]

  useEffect(() => {
    if (!loading) return
    setMsgIdx(0)
    const id = setInterval(() => setMsgIdx(i => (i + 1) % spinnerMessages.length), 2200)
    return () => clearInterval(id)
  }, [loading])

  async function handleAnalyze() {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setLimitReached(false)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (res.status === 429 && data.error === 'free_limit_reached') {
        setLimitReached(true)
        return
      }
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 640, margin: '0 auto' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ctaPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); } 50% { box-shadow: 0 0 0 8px rgba(139,92,246,0.18); } }
        @keyframes topPickGlow { 0%, 100% { box-shadow: 0 0 4px 0 rgba(139,92,246,0.3); } 50% { box-shadow: 0 0 14px 4px rgba(139,92,246,0.55); } }
        @keyframes inputAurora { 0%, 100% { box-shadow: 0 0 0 1.5px rgba(139,92,246,0.35), 0 0 14px rgba(139,92,246,0.12); } 50% { box-shadow: 0 0 0 1.5px rgba(196,181,253,0.65), 0 0 28px rgba(139,92,246,0.28), 0 0 50px rgba(139,92,246,0.1); } }
        .aurora-input { border: none !important; animation: inputAurora 2.8s ease-in-out infinite; outline: none !important; }
        .aurora-input:focus { box-shadow: 0 0 0 2px rgba(196,181,253,0.8), 0 0 36px rgba(139,92,246,0.35) !important; animation-play-state: paused; }
      `}</style>
      {/* Input row */}
      <div className="analyzer-input-row" style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
          placeholder="https://youtube.com/@channelname"
          disabled={loading}
          className="aurora-input"
          style={{
            flex: 1, padding: '14px 18px', borderRadius: 10, fontSize: 15,
            background: 'var(--surface)',
            color: 'var(--text)', outline: 'none', transition: 'opacity 0.15s',
            fontFamily: 'inherit', opacity: loading ? 0.5 : 1,
          }}
        />
        <TiltCard sparkle scale={1.04} tiltLimit={10} style={{ display: 'inline-block', borderRadius: 10 }}>
          <button
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            style={{
              padding: '14px 24px', borderRadius: 10, fontWeight: 700, fontSize: 15,
              background: loading || !url.trim() ? 'var(--border)' : 'var(--accent)',
              color: loading || !url.trim() ? 'var(--muted)' : 'var(--bg)',
              border: 'none', cursor: loading || !url.trim() ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s', whiteSpace: 'nowrap', fontFamily: 'inherit',
            }}
          >
            {loading ? 'Analyzing…' : 'Analyze Channel'}
          </button>
        </TiltCard>
      </div>

      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 40 }}>
        No account required. Works with any public YouTube channel.
      </p>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spinner />
          <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 16 }}>
            {spinnerMessages[msgIdx]}
          </p>
        </div>
      )}

      {/* Daily limit reached */}
      {limitReached && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.05))',
          border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12,
          padding: '28px 24px', textAlign: 'center',
          animation: 'ctaPulse 2.5s ease-in-out infinite',
        }}>
          <p style={{ fontSize: 22, marginBottom: 10 }}>🔒</p>
          <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Daily limit reached</p>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Free tier includes 3 analyses per day. Upgrade to Pro for unlimited analyses, all 5 ranked ideas, and AI thumbnail generation.
          </p>
          <CheckoutButton style={{
            background: 'var(--accent)', color: 'var(--bg)', border: 'none',
            padding: '11px 28px', borderRadius: 8, fontWeight: 700, fontSize: 14,
            cursor: 'pointer', fontFamily: 'inherit',
          }} />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '16px 20px', textAlign: 'left',
        }}>
          <p style={{ fontSize: 14, color: '#f87171', fontWeight: 500 }}>{error}</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div style={{ textAlign: 'left', marginTop: 8 }}>
          <div className="result-header" style={{ marginBottom: 28, padding: '16px 20px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Analyzing</p>
              <p style={{ fontSize: 16, fontWeight: 700 }}>{result.channelName}</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                {result.subscriberCount} subscribers · {result.totalVideosAnalyzed} videos analyzed
              </p>
            </div>
            <button
              onClick={() => { setResult(null); setUrl('') }}
              style={{
                background: 'none', border: '1px solid var(--border)', borderRadius: 8,
                color: 'var(--muted)', fontSize: 13, fontWeight: 500,
                padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}
            >
              Try another →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {result.ideas.map((idea, i) => (
              <IdeaCard key={i} idea={idea} index={i} isPro={isPro} faceRefs={result.faceRefs} thumbnailStyle={result.thumbnailStyle} channelName={result.channelName} />
            ))}
          </div>

          {!isPro && (
            <div style={{
              marginTop: 24, padding: '20px', background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.05))',
              border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12, textAlign: 'center',
              animation: 'ctaPulse 2.5s ease-in-out infinite',
            }}>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                🔒 4 more ideas are waiting
              </p>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                Upgrade to Pro to unlock all 5 ranked ideas with full details.
              </p>
              <CheckoutButton style={{
                background: 'var(--accent)', color: 'var(--bg)', border: 'none',
                padding: '10px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14,
                cursor: 'pointer', fontFamily: 'inherit',
              }} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function IdeaCard({ idea, index, isPro, faceRefs, thumbnailStyle, channelName }: { idea: VideoIdea; index: number; isPro: boolean; faceRefs?: string[]; thumbnailStyle?: string; channelName?: string }) {
  const isLocked = index > 0 && !isPro
  const [thumbState, setThumbState] = useState<'idle' | 'loading' | 'done' | 'error' | 'pro_required'>('idle')
  const [thumbUrl, setThumbUrl] = useState<string | null>(null)
  const [thumbError, setThumbError] = useState<string | null>(null)
  const [thumbDebug, setThumbDebug] = useState<Record<string, unknown> | null>(null)

  async function generateThumbnail() {
    if (!isPro) { setThumbState('pro_required'); return }
    setThumbState('loading')
    setThumbError(null)
    setThumbDebug(null)
    try {
      const res = await fetch('/api/generate-thumbnail', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: idea.title, faceRefs, thumbnailStyle, channelName, _t: Date.now() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setThumbUrl(data.imageUrl)
      setThumbDebug(data._debug ?? null)
      setThumbState('done')
    } catch (err) {
      setThumbError(err instanceof Error ? err.message : 'Generation failed')
      setThumbState('error')
    }
  }

  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '24px',
        filter: isLocked ? 'blur(5px)' : 'none',
        userSelect: isLocked ? 'none' : 'auto',
        pointerEvents: isLocked ? 'none' : 'auto',
        transition: 'border-color 0.2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{
            minWidth: 28, height: 28, borderRadius: 8,
            background: index === 0 ? 'var(--accent)' : 'var(--surface)',
            color: index === 0 ? 'var(--bg)' : 'var(--muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, border: '1px solid var(--border)',
          }}>
            #{idea.rank}
          </span>
          {index === 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--accent)', background: 'rgba(139,92,246,0.12)',
              padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(139,92,246,0.35)',
              letterSpacing: '0.5px', animation: 'topPickGlow 2s ease-in-out infinite',
            }}>
              TOP PICK
            </span>
          )}
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4, marginBottom: 12, color: 'var(--text)' }}>
          {idea.title}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Why it'll perform
            </span>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, lineHeight: 1.6 }}>
              {idea.performanceReason}
            </p>
          </div>
        </div>

        {/* Thumbnail generation — button visible to all, gated for free */}
        {!isLocked && (
          <div style={{ marginTop: 18, textAlign: 'center' }}>
            {thumbState === 'idle' && (
              <TiltCard sparkle scale={1.05} tiltLimit={12} style={{ display: 'inline-block', borderRadius: 8 }}>
                <button
                  onClick={generateThumbnail}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: 'rgba(139,92,246,0.1)', color: 'var(--accent-light)',
                    border: '1px solid rgba(139,92,246,0.3)', cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  ✦ Generate Thumbnail
                </button>
              </TiltCard>
            )}

            {thumbState === 'pro_required' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)',
                borderRadius: 8,
              }}>
                <span style={{ fontSize: 14 }}>🔒</span>
                <span style={{ fontSize: 13, color: 'var(--muted)', flex: 1 }}>Thumbnail generation is Pro only.</span>
                <CheckoutButton style={{
                  background: 'var(--accent)', color: 'var(--bg)', border: 'none',
                  padding: '6px 14px', borderRadius: 6, fontWeight: 700, fontSize: 12,
                  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                }} />
              </div>
            )}


            {thumbState === 'error' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: '#f87171' }}>{thumbError}</span>
                <button onClick={generateThumbnail} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Retry</button>
              </div>
            )}

            {thumbState === 'done' && thumbUrl && isPro && (
              <div style={{ marginTop: 4 }}>
                <img
                  src={thumbUrl}
                  alt="Generated thumbnail"
                  style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)', display: 'block' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Generated thumbnail</span>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <a href={thumbUrl} download="thumbnail.jpg" target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                      ↓ Download
                    </a>
                    <button onClick={() => { setThumbState('idle'); setThumbUrl(null); setThumbDebug(null) }}
                      style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Regenerate
                    </button>
                  </div>
                </div>
                {thumbDebug && (
                  <details style={{ marginTop: 8 }}>
                    <summary style={{ fontSize: 11, color: 'var(--muted)', cursor: 'pointer' }}>Debug info</summary>
                    <pre style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {JSON.stringify(thumbDebug, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}

          </div>
        )}
      </div>

      {thumbState === 'loading' && (
        <>
          <style>{`
            @keyframes clSpin { to { transform: rotate(360deg); } }
            .cl-ring { position: absolute; inset: 0; border-radius: 12px; overflow: hidden; pointer-events: none; z-index: 2; }
            .cl-ring::before {
              content: '';
              position: absolute;
              width: 200%; height: 200%;
              top: -50%; left: -50%;
              background: conic-gradient(from 0deg, transparent 330deg, #8b5cf6 345deg, #c4b5fd 355deg, transparent 360deg);
              animation: clSpin 2s linear infinite;
            }
            .cl-ring::after {
              content: '';
              position: absolute;
              inset: 2px;
              background: var(--card);
              border-radius: 10px;
            }
          `}</style>
          <div className="cl-ring" />
        </>
      )}

      {isLocked && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 8, borderRadius: 12,
          background: 'rgba(9,9,15,0.5)',
        }}>
          <span style={{ fontSize: 22 }}>🔒</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Pro only</span>
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      border: '3px solid var(--border)',
      borderTopColor: 'var(--accent)',
      animation: 'spin 0.7s linear infinite',
      margin: '0 auto',
    }}>
    </div>
  )
}

