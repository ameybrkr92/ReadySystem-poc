import React, { useState } from 'react'
import { USERS, ROLES, DEMO_PASSWORD } from '../data/seed.js'
import { Icon } from './Icons.jsx'

// Demo login. Pick a role card (one-click) or type a username + password.
// All accounts share the demo password — this is in-memory demo auth.
export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    const user = USERS.find((u) => u.username === username.trim().toLowerCase())
    if (!user || password !== DEMO_PASSWORD) {
      setError('Invalid login. Use a role below — demo password is "ready".')
      return
    }
    onLogin(user)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-teal-950 p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between bg-charcoal-900 p-10 text-white lg:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500 text-lg font-bold">
                RS
              </div>
              <div>
                <div className="text-lg font-bold">Ready Systems</div>
                <div className="text-xs text-charcoal-400">Operations Platform</div>
              </div>
            </div>
            <h2 className="mt-12 text-2xl font-bold leading-snug">
              Watch the whole shop run —<br />from one screen.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-charcoal-300">
              Wire-harness &amp; MV switchgear for Siemens. Planning, Purchase, Stores and
              Quality — one connected system, live.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-charcoal-400">
            <span className="rounded bg-amber-400/20 px-1.5 py-0.5 font-bold uppercase tracking-wide text-amber-300">
              Demo
            </span>
            Simulated data · for walkthrough only
          </div>
        </div>

        {/* Login form */}
        <div className="p-8 sm:p-10">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 font-bold text-white">
              RS
            </div>
            <span className="font-bold text-charcoal-800">Ready Systems</span>
          </div>

          <h1 className="text-xl font-bold text-charcoal-800">Sign in</h1>
          <p className="mt-1 text-sm text-charcoal-500">Choose your role, or sign in below.</p>

          <form onSubmit={submit} className="mt-5 space-y-3">
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
                placeholder="Username (e.g. director)"
                className="w-full rounded-lg border border-charcoal-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>
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
                placeholder="Password"
                className="w-full rounded-lg border border-charcoal-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>
            {error && <p className="text-xs font-medium text-red-600">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
            >
              Sign in
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-charcoal-400">
            <span className="h-px flex-1 bg-charcoal-100" />
            quick login
            <span className="h-px flex-1 bg-charcoal-100" />
          </div>

          <div className="grid grid-cols-1 gap-2">
            {USERS.map((u) => {
              const role = ROLES[u.role]
              return (
                <button
                  key={u.username}
                  onClick={() => onLogin(u)}
                  className="group flex items-center gap-3 rounded-lg border border-charcoal-100 p-2.5 text-left transition-colors hover:border-teal-300 hover:bg-teal-50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-charcoal-700 text-xs font-bold text-white">
                    {u.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-charcoal-800">{role.label}</div>
                    <div className="truncate text-xs text-charcoal-500">{role.blurb}</div>
                  </div>
                  <span className="text-charcoal-300 group-hover:text-teal-600">
                    <Icon.chevronRight size={18} />
                  </span>
                </button>
              )
            })}
          </div>
          <p className="mt-4 text-center text-xs text-charcoal-400">Demo password: ready</p>
        </div>
      </div>
    </div>
  )
}
