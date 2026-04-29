'use client'

import { useState } from 'react'

export default function RestoreAccessButton() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRestore() {
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Restore failed')
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Restore failed')
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="nav-link"
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
      >
        Already Pro?
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleRestore()}
          placeholder="your@email.com"
          autoFocus
          style={{
            padding: '8px 12px', borderRadius: 8, fontSize: 13,
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
            width: 200,
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
        <button
          onClick={handleRestore}
          disabled={loading || !email.trim()}
          style={{
            padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: 'var(--accent)', color: 'var(--bg)', border: 'none',
            cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !email.trim() ? 0.5 : 1,
            fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}
        >
          {loading ? '…' : 'Restore'}
        </button>
        <button
          onClick={() => { setOpen(false); setError(null) }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 16, color: 'var(--muted)', fontFamily: 'inherit', padding: 0,
          }}
        >
          ✕
        </button>
      </div>
      {error && (
        <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{error}</p>
      )}
    </div>
  )
}
