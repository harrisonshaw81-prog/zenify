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
  ideas: VideoIdea[]
}

export default function Analyzer({ isPro = false }: { isPro?: boolean }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
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
      {/* Input row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
          placeholder="https://youtube.com/@channelname"
          style={{
            flex: 1, padding: '14px 18px', borderRadius: 10, fontSize: 15,
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--text)', outline: 'none', transition: 'border-color 0.15s',
            fontFamily: 'inherit',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
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
            Fetching videos and generating ideas…
          </p>
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
          <div style={{ marginBottom: 28, padding: '16px 20px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Analyzing</p>
            <p style={{ fontSize: 16, fontWeight: 700 }}>{result.channelName}</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
              {result.subscriberCount} subscribers · {result.totalVideosAnalyzed} videos analyzed
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {result.ideas.map((idea, i) => (
              <IdeaCard key={i} idea={idea} index={i} isPro={isPro} faceRefs={result.faceRefs} channelAvatar={result.channelAvatar} />
            ))}
          </div>

          {!isPro && (
            <div style={{
              marginTop: 24, padding: '20px', background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.05))',
              border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12, textAlign: 'center',
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

function IdeaCard({ idea, index, isPro, faceRefs, channelAvatar }: { idea: VideoIdea; index: number; isPro: boolean; faceRefs?: string[]; channelAvatar?: string }) {
  const isLocked = index > 0 && !isPro
  const [thumbState, setThumbState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [thumbUrl, setThumbUrl] = useState<string | null>(null)
  const [thumbError, setThumbError] = useState<string | null>(null)

  async function generateThumbnail() {
    if (!isPro) {
      // Free tier: show static blurred placeholder — no API call
      setThumbUrl('/thumb-placeholder.png')
      setThumbState('done')
      return
    }
    setThumbState('loading')
    setThumbError(null)
    try {
      const res = await fetch('/api/generate-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: idea.thumbnailConcept, title: idea.title, faceRefs, channelAvatar }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setThumbUrl(data.imageUrl)
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
              padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(139,92,246,0.25)',
              letterSpacing: '0.5px',
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
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Thumbnail concept
            </span>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, lineHeight: 1.6 }}>
              {idea.thumbnailConcept}
            </p>
          </div>
        </div>

        {/* Thumbnail generation — visible to all unlocked cards */}
        {!isLocked && (
          <div style={{ marginTop: 18 }}>
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

            {thumbState === 'loading' && <LoadingDots />}

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
                    <button onClick={() => { setThumbState('idle'); setThumbUrl(null) }}
                      style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            )}

            {thumbState === 'done' && thumbUrl && !isPro && (
              <div style={{ position: 'relative', marginTop: 4, borderRadius: 8, overflow: 'hidden' }}>
                <img
                  src={thumbUrl}
                  alt="Thumbnail preview"
                  style={{ width: '100%', display: 'block', filter: 'blur(12px)', transform: 'scale(1.05)' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(9,9,15,0.55)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 22 }}>🔒</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                    Your thumbnail is ready
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                    Upgrade to Pro to view & download it
                  </p>
                  <CheckoutButton style={{
                    marginTop: 4, padding: '8px 18px', borderRadius: 8,
                    background: 'var(--accent)', color: 'var(--bg)',
                    border: 'none', fontWeight: 700, fontSize: 13,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function LoadingDots() {
  const [dots, setDots] = useState(1)
  useEffect(() => {
    const id = setInterval(() => setDots(d => d === 3 ? 1 : d + 1), 500)
    return () => clearInterval(id)
  }, [])
  return (
    <span style={{ fontSize: 13, color: 'var(--muted)', padding: '9px 0', display: 'block' }}>
      Generating thumbnail{'.'.repeat(dots)}
    </span>
  )
}
