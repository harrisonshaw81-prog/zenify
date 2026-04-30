'use client'

import { useRef, useState } from 'react'

export default function AnalyzerCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [glow, setGlow] = useState({ x: 50, y: 50 })
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = ref.current!.getBoundingClientRect()
    setGlow({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    })
    setTilt({
      x: ((e.clientY - (r.top + r.height / 2)) / r.height) * -3,
      y: ((e.clientX - (r.left + r.width / 2)) / r.width) * 3,
    })
  }

  function onMouseEnter() { setHovered(true) }
  function onMouseLeave() {
    setHovered(false)
    setGlow({ x: 50, y: 50 })
    setTilt({ x: 0, y: 0 })
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        maxWidth: 960, margin: '0 auto', position: 'relative',
        background: 'rgba(139,92,246,0.04)',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: 24,
        padding: '48px 48px 40px',
        boxShadow: `0 0 0 1px rgba(139,92,246,0.08), 0 24px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(139,92,246,0.15)${hovered ? ', 0 0 50px rgba(139,92,246,0.12)' : ''}`,
        transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.15s ease, box-shadow 0.3s ease',
        willChange: 'transform',
      }}
    >
      {/* Cursor-following radial glow */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 24, pointerEvents: 'none',
        background: `radial-gradient(circle 380px at ${glow.x}% ${glow.y}%, rgba(139,92,246,0.13) 0%, transparent 70%)`,
        transition: 'background 0.06s linear',
      }} />

      {/* Corner accents */}
      <div style={{ position: 'absolute', top: -1, left: -1, width: 40, height: 40, borderTop: '2px solid var(--accent)', borderLeft: '2px solid var(--accent)', borderRadius: '24px 0 0 0', opacity: 0.6, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: -1, right: -1, width: 40, height: 40, borderTop: '2px solid var(--accent)', borderRight: '2px solid var(--accent)', borderRadius: '0 24px 0 0', opacity: 0.6, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -1, left: -1, width: 40, height: 40, borderBottom: '2px solid var(--accent)', borderLeft: '2px solid var(--accent)', borderRadius: '0 0 0 24px', opacity: 0.6, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -1, right: -1, width: 40, height: 40, borderBottom: '2px solid var(--accent)', borderRight: '2px solid var(--accent)', borderRadius: '0 0 24px 0', opacity: 0.6, pointerEvents: 'none' }} />

      {/* Content above glow layer */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
