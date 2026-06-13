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

export function SectionTitle({ children, sub, action }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-charcoal-800">{children}</h2>
        {sub && <p className="mt-0.5 text-sm text-charcoal-500">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

// Primary / secondary buttons used across modules and forms.
export function Button({ children, onClick, variant = 'primary', type = 'button', className = '', disabled }) {
  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 disabled:bg-charcoal-200 disabled:text-charcoal-400',
    secondary: 'bg-white text-charcoal-600 ring-1 ring-charcoal-200 hover:bg-charcoal-50',
    ghost: 'text-charcoal-500 hover:bg-charcoal-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// Labelled field wrapper.
export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-charcoal-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-charcoal-400">{hint}</span>}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-charcoal-200 bg-white px-3 py-2 text-sm text-charcoal-800 outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-100'

export function Input(props) {
  return <input {...props} className={`${inputCls} ${props.className || ''}`} />
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={`${inputCls} ${props.className || ''}`}>
      {children}
    </select>
  )
}
