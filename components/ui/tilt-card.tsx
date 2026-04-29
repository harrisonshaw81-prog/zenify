'use client'

import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

export interface TiltCardProps {
  tiltLimit?: number
  scale?: number
  perspective?: number
  effect?: 'gravitate' | 'evade'
  spotlight?: boolean
  sparkle?: boolean
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]
const DIST = 32

export function TiltCard({
  tiltLimit = 15,
  scale = 1.05,
  perspective = 1200,
  effect = 'evade',
  spotlight = true,
  sparkle = false,
  className,
  style,
  children,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState(
    `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
  )
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)
  const [sparkleKey, setSparkleKey] = useState(0)

  const dir = effect === 'evade' ? -1 : 1

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const el = cardRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      const xRot = (py - 0.5) * (tiltLimit * 2) * dir
      const yRot = (px - 0.5) * -(tiltLimit * 2) * dir
      setTransform(
        `perspective(${perspective}px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale3d(${scale}, ${scale}, ${scale})`
      )
      if (spotlight) setSpotlightPos({ x: px * 100, y: py * 100 })
    },
    [tiltLimit, scale, perspective, dir, spotlight]
  )

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true)
    if (sparkle) setSparkleKey(k => k + 1)
  }, [sparkle])

  const handlePointerLeave = useCallback(() => {
    setTransform(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`)
    setIsHovered(false)
  }, [perspective])

  return (
    <div
      ref={cardRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn('will-change-transform relative overflow-hidden', className)}
      style={{
        transform,
        transition: 'transform 0.2s ease-out',
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {children}

      {spotlight && (
        <div
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
          style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s' }}
        >
          <div
            className="absolute w-[200%] h-[200%] rounded-full"
            style={{
              left: `${spotlightPos.x}%`,
              top: `${spotlightPos.y}%`,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 40%)',
            }}
          />
        </div>
      )}

      {sparkle && sparkleKey > 0 && ANGLES.map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const tx = Math.cos(rad) * DIST
        const ty = Math.sin(rad) * DIST
        const size = i % 2 === 0 ? 5 : 3
        return (
          <div
            key={`${sparkleKey}-${i}`}
            className="pointer-events-none absolute z-20"
            style={{
              left: '50%',
              top: '50%',
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              borderRadius: '50%',
              background: i % 3 === 0 ? 'var(--accent-light)' : 'rgba(255,255,255,0.9)',
              animationName: 'sparkle-burst',
              animationDuration: `${0.5 + i * 0.025}s`,
              animationFillMode: 'forwards',
              animationTimingFunction: 'ease-out',
              animationDelay: `${i * 30}ms`,
              '--spark-x': `${tx}px`,
              '--spark-y': `${ty}px`,
            } as React.CSSProperties}
          />
        )
      })}
    </div>
  )
}
