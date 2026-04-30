'use client'

import { useState } from 'react'
import { TiltCard } from '@/components/ui/tilt-card'

export default function CheckoutButton({ style }: { style?: React.CSSProperties }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <TiltCard
      sparkle
      scale={1.04}
      tiltLimit={10}
      style={{
        display: 'inline-block',
        width: style?.width,
        borderRadius: style?.borderRadius ?? 8,
      }}
    >
      <button onClick={handleClick} disabled={loading} style={style}>
        {loading ? 'Redirecting…' : 'Get Pro - $19/month'}
      </button>
    </TiltCard>
  )
}
