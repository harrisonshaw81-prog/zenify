'use client'

import { useState, useEffect } from 'react'
import { TiltCard } from '@/components/ui/tilt-card'

export default function CheckoutButton({ style, plan = 'monthly', label }: { style?: React.CSSProperties; plan?: 'monthly' | 'annual'; label?: string }) {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const reset = () => setLoading(false)
    window.addEventListener('pageshow', reset)
    return () => window.removeEventListener('pageshow', reset)
  }, [])

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
      }
    } catch {
      alert('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const defaultLabel = plan === 'annual' ? 'Get Pro - $180/year' : 'Get Pro - $19/month'

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
        {loading ? 'Redirecting…' : (label ?? defaultLabel)}
      </button>
    </TiltCard>
  )
}
