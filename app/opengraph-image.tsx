import { ImageResponse } from 'next/og'

export const alt = 'HypeCTR - YouTube Channel Analyzer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#09090f',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 24px',
            borderRadius: 999,
            border: '1px solid rgba(139,92,246,0.5)',
            background: 'rgba(139,92,246,0.12)',
            fontSize: 18,
            fontWeight: 500,
            color: '#a78bfa',
            marginBottom: 40,
            letterSpacing: '0.5px',
          }}
        >
          AI-Powered YouTube Analysis
        </div>

        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: '-4px',
            marginBottom: 24,
            display: 'flex',
            lineHeight: 1,
          }}
        >
          <span style={{ color: '#ffffff' }}>Hype</span>
          <span style={{ color: '#8b5cf6' }}>CTR</span>
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: '#9090b0',
            textAlign: 'center',
            maxWidth: 780,
            lineHeight: 1.45,
            marginBottom: 60,
          }}
        >
          Paste any YouTube channel URL. Get 5 ranked video ideas with AI performance predictions.
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          {['Free to try', 'No account needed', 'AI thumbnails included'].map((text) => (
            <div
              key={text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 999,
                background: '#14141e',
                border: '1px solid #2a2a3f',
                fontSize: 18,
                color: '#ffffff',
              }}
            >
              <span style={{ color: '#8b5cf6' }}>✓</span>
              {text}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
