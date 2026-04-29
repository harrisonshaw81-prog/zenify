'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number; y: number; r: number
  baseOp: number; phase: number; twinkleSpd: number
  dx: number; dy: number; rgb: string
  pMult: number
}

interface Streak {
  x: number; y: number; vx: number; vy: number
  len: number; born: number; dur: number
}

interface Nebula {
  x: number; y: number; vx: number; vy: number
  rx: number; ry: number; phase: number; rgb: string
}

const PALETTES = ['255,255,255', '230,220,255', '210,225,255', '255,248,240']
const NEBULA_COLORS = ['139,92,246', '109,40,217', '124,58,237', '76,29,149']

export default function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    let raf: number
    let prevTime = 0
    let shotCooldown = 3500 + Math.random() * 4500
    let shotElapsed = 0
    let stars: Star[] = []
    let streaks: Streak[] = []
    let nebulae: Nebula[] = []
    const mouse = { x: 0.5, y: 0.5 }
    const parallax = { x: 0, y: 0 }
    const MAX_PARALLAX = 28

    function initStars() {
      const w = canvas.width, h = canvas.height
      nebulae = Array.from({ length: 5 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.12,
        rx: 220 + Math.random() * 280,
        ry: 140 + Math.random() * 180,
        phase: Math.random() * Math.PI * 2,
        rgb: NEBULA_COLORS[Math.floor(Math.random() * NEBULA_COLORS.length)],
      }))
      stars = Array.from({ length: 210 }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.2,
        baseOp: Math.random() * 0.55 + 0.15,
        phase: Math.random() * Math.PI * 2,
        twinkleSpd: Math.random() * 0.018 + 0.004,
        dx: (Math.random() - 0.5) * 0.04,
        dy: (Math.random() - 0.5) * 0.04,
        rgb: PALETTES[Math.floor(Math.random() * PALETTES.length)],
        pMult: [0.2, 0.55, 1.0][i % 3],
      }))
    }

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }

    function onMouseMove(e: MouseEvent) {
      mouse.x = e.clientX / window.innerWidth
      mouse.y = e.clientY / window.innerHeight
    }

    function spawnStreak() {
      const w = canvas.width, h = canvas.height
      const fromTop = Math.random() < 0.7
      const sx = fromTop ? Math.random() * w * 1.2 - w * 0.1 : w + 10
      const sy = fromTop ? -10 : Math.random() * h * 0.4
      const angle = Math.PI / 7 + Math.random() * (Math.PI / 5)
      const speed = 450 + Math.random() * 380
      streaks.push({
        x: sx, y: sy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 85 + Math.random() * 110,
        born: performance.now(),
        dur: 850 + Math.random() * 650,
      })
    }

    function draw(now: number) {
      if (!prevTime) prevTime = now
      const dt = Math.min((now - prevTime) / 1000, 0.05)
      prevTime = now
      shotElapsed += dt * 1000

      // smooth parallax toward mouse
      parallax.x += ((mouse.x - 0.5) * MAX_PARALLAX - parallax.x) * 0.04
      parallax.y += ((mouse.y - 0.5) * MAX_PARALLAX - parallax.y) * 0.04

      const w = canvas.width, h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // Nebula blobs (behind everything)
      for (const n of nebulae) {
        n.phase += 0.0015
        n.x += n.vx; n.y += n.vy
        if (n.x < -n.rx) n.x = w + n.rx
        else if (n.x > w + n.rx) n.x = -n.rx
        if (n.y < -n.ry) n.y = h + n.ry
        else if (n.y > h + n.ry) n.y = -n.ry
        const op = (0.07 + 0.04 * Math.sin(n.phase)).toFixed(3)
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.rx)
        grad.addColorStop(0, `rgba(${n.rgb},${op})`)
        grad.addColorStop(0.5, `rgba(${n.rgb},${(parseFloat(op) * 0.4).toFixed(3)})`)
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.save()
        ctx.translate(n.x, n.y)
        ctx.scale(1, n.ry / n.rx)
        ctx.translate(-n.x, -n.y)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.rx, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Stars with per-layer parallax offset
      for (const s of stars) {
        s.phase += s.twinkleSpd
        s.x += s.dx; s.y += s.dy
        if (s.x < -2) s.x = w + 2
        else if (s.x > w + 2) s.x = -2
        if (s.y < -2) s.y = h + 2
        else if (s.y > h + 2) s.y = -2

        const op = s.baseOp * (0.35 + 0.65 * (Math.sin(s.phase) * 0.5 + 0.5))
        ctx.beginPath()
        ctx.arc(s.x + parallax.x * s.pMult, s.y + parallax.y * s.pMult, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${s.rgb},${op.toFixed(3)})`
        ctx.fill()
      }

      // Shooting star timer
      if (shotElapsed >= shotCooldown) {
        spawnStreak()
        shotElapsed = 0
        shotCooldown = 3500 + Math.random() * 4500
      }

      // Shooting stars
      streaks = streaks.filter(s => {
        const age = now - s.born
        const t = age / s.dur
        if (t >= 1) return false

        s.x += s.vx * dt
        s.y += s.vy * dt

        let op: number
        if (t < 0.2) op = t / 0.2
        else if (t < 0.6) op = 1
        else op = 1 - (t - 0.6) / 0.4
        op = Math.max(0, Math.min(1, op)) * 0.92

        const mag = Math.hypot(s.vx, s.vy)
        const nx = s.vx / mag, ny = s.vy / mag
        const tx = s.x - nx * s.len
        const ty = s.y - ny * s.len

        const grad = ctx.createLinearGradient(tx, ty, s.x, s.y)
        grad.addColorStop(0, `rgba(255,255,255,0)`)
        grad.addColorStop(0.55, `rgba(195,195,255,${(op * 0.45).toFixed(3)})`)
        grad.addColorStop(1, `rgba(255,255,255,${op.toFixed(3)})`)
        ctx.beginPath()
        ctx.moveTo(tx, ty)
        ctx.lineTo(s.x, s.y)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.6
        ctx.lineCap = 'round'
        ctx.stroke()

        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 5)
        glow.addColorStop(0, `rgba(255,255,255,${(op * 0.7).toFixed(3)})`)
        glow.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.beginPath()
        ctx.arc(s.x, s.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        ctx.beginPath()
        ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${op.toFixed(3)})`
        ctx.fill()

        return true
      })

      raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  )
}
