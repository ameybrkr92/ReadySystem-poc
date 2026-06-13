import React, { useState } from 'react'
import { USERS, ROLES, DEMO_PASSWORD } from '../data/seed.js'
import { Icon } from './Icons.jsx'

// Professional, enterprise-style sign-in. Demo credentials are not shown on the
// front page — they sit behind a discreet "Demo access" toggle so the
// walkthrough still works without cluttering the login.
export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showDemo, setShowDemo] = useState(false)

  function submit(e) {
    e.preventDefault()
    const user = USERS.find((u) => u.username === username.trim().toLowerCase())
    if (!user || password !== DEMO_PASSWORD) {
      setError('Incorrect username or password.')
      return
    }
    onLogin(user)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-charcoal-950 px-4">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-teal-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 text-xl font-extrabold text-white shadow-lg shadow-teal-900/40">
            RS
          </div>
          <h1 className="mt-4 text-xl font-bold text-white">Ready Systems</h1>
          <p className="mt-1 text-sm text-charcoal-400">Operations Platform</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/95 p-7 shadow-2xl backdrop-blur">
          <h2 className="text-lg font-bold text-charcoal-800">Sign in</h2>
          <p className="mt-0.5 text-sm text-charcoal-500">Enter your credentials to continue.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                Username
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">
                  <Icon.user size={18} />
                </span>
                <input
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setError('')
                  }}
                  autoFocus
                  className="w-full rounded-lg border border-charcoal-200 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  placeholder="username"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">
                  <Icon.lock size={18} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  className="w-full rounded-lg border border-charcoal-200 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                <Icon.alert size={15} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
            >
              Sign in
            </button>
          </form>

          {/* Discreet demo access — collapsed by default */}
          <div className="mt-5 border-t border-charcoal-100 pt-4">
            <button
              onClick={() => setShowDemo((s) => !s)}
              className="flex w-full items-center justify-between text-xs font-medium text-charcoal-400 hover:text-charcoal-600"
            >
              <span>Demo access</span>
              <span className={`transition-transform ${showDemo ? 'rotate-90' : ''}`}>
                <Icon.chevronRight size={14} />
              </span>
            </button>
            {showDemo && (
              <div className="mt-3 grid grid-cols-1 gap-1.5">
                {USERS.map((u) => (
                  <button
                    key={u.username}
                    onClick={() => onLogin(u)}
                    className="flex items-center gap-2.5 rounded-lg border border-charcoal-100 px-2.5 py-1.5 text-left transition-colors hover:border-teal-300 hover:bg-teal-50"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-charcoal-700 text-[10px] font-bold text-white">
                      {u.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-charcoal-700">{ROLES[u.role].label}</span>
                      <span className="block truncate text-[11px] text-charcoal-400">{u.username} · {DEMO_PASSWORD}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-charcoal-500">
          <span className="rounded bg-amber-400/20 px-1.5 py-0.5 font-bold uppercase tracking-wide text-amber-300">
            Demo
          </span>{' '}
          Simulated data · walkthrough only
        </p>
      </div>
    </div>
  )
}
