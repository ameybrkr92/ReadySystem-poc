import React from 'react'

// Status pill used across modules. Colour follows the demo's status language.
export function StatusBadge({ status }) {
  const map = {
    ontrack: { label: 'On track', cls: 'bg-teal-100 text-teal-800' },
    stuck: { label: 'Stuck', cls: 'bg-red-100 text-red-700' },
    done: { label: 'Done', cls: 'bg-charcoal-100 text-charcoal-600' },
    pending: { label: 'Pending', cls: 'bg-charcoal-100 text-charcoal-500' },
  }
  const s = map[status] || map.pending
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}>
      {status === 'stuck' && <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500" />}
      {s.label}
    </span>
  )
}

// Generic coloured tag.
export function Tag({ children, tone = 'grey' }) {
  const tones = {
    grey: 'bg-charcoal-100 text-charcoal-600',
    teal: 'bg-teal-100 text-teal-800',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-700',
    green: 'bg-emerald-100 text-emerald-700',
  }
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

// Section card container with optional title.
export function Card({ title, action, children, className = '' }) {
  return (
    <div className={`rounded-xl bg-white shadow-sm ring-1 ring-charcoal-100 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-charcoal-100 px-5 py-3">
          {title && <h3 className="text-sm font-semibold text-charcoal-700">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

export function SectionTitle({ children, sub }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-charcoal-800">{children}</h2>
      {sub && <p className="mt-0.5 text-sm text-charcoal-500">{sub}</p>}
    </div>
  )
}
