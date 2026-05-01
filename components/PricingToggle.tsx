'use client'

import { useState } from 'react'
import CheckoutButton from '@/components/CheckoutButton'

export default function PricingToggle({ buttonStyle }: { buttonStyle?: React.CSSProperties }) {
  const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly')

  return (
    <div>
      {/* Toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: 3, marginBottom: 20,
      }}>
        {(['monthly', 'annual'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPlan(p)}
            style={{
              flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: plan === p ? 'var(--accent)' : 'transparent',
              color: plan === p ? 'var(--bg)' : 'var(--muted)',
              transition: 'background 0.15s, color 0.15s',
              position: 'relative',
            }}
          >
            {p === 'monthly' ? 'Monthly' : (
              <span>
                Annual
                <span style={{
                  marginLeft: 6, fontSize: 10, fontWeight: 700,
                  background: plan === 'annual' ? 'rgba(0,0,0,0.2)' : 'rgba(139,92,246,0.15)',
                  color: plan === 'annual' ? 'inherit' : 'var(--accent)',
                  padding: '1px 6px', borderRadius: 999,
                }}>
                  Save 21%
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Price display */}
      <div style={{ marginBottom: 20 }}>
        {plan === 'monthly' ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px' }}>$19</span>
            <span style={{ fontSize: 16, color: 'var(--muted)' }}>/month</span>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px' }}>$15</span>
              <span style={{ fontSize: 16, color: 'var(--muted)' }}>/month</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
              Billed as $180/year
            </div>
          </div>
        )}
      </div>

      <CheckoutButton plan={plan} style={buttonStyle} />
    </div>
  )
}
