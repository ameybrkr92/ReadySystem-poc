import React from 'react'

// Status pill — dot + subtle tinted background. Used across modules.
export function StatusBadge({ status }) {
  const map = {
    ontrack: { label: 'On track', cls: 'bg-teal-50 text-teal-700 ring-teal-100', dot: 'bg-teal-500' },
    stuck: { label: 'Stuck', cls: 'bg-red-50 text-red-700 ring-red-100', dot: 'bg-red-500' },
    done: { label: 'Done', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-100', dot: 'bg-emerald-500' },
    pending: { label: 'Pending', cls: 'bg-charcoal-100 text-charcoal-500 ring-charcoal-200', dot: 'bg-charcoal-400' },
  }
  const s = map[status] || map.pending
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${s.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot} ${status === 'stuck' ? 'animate-pulse' : ''}`} />
      {s.label}
    </span>
  )
}

// Generic coloured tag.
export function Tag({ children, tone = 'grey' }) {
  const tones = {
    grey: 'bg-charcoal-100 text-charcoal-600 ring-charcoal-200',
    teal: 'bg-teal-50 text-teal-700 ring-teal-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    red: 'bg-red-50 text-red-700 ring-red-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  }
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

// Section card. Refined: hairline border + soft shadow, tighter header.
export function Card({ title, action, children, className = '', bodyClass = 'p-5' }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-charcoal-200/70 bg-white shadow-card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-charcoal-100 px-5 py-3.5">
          {title && <h3 className="text-sm font-semibold tracking-tightish text-charcoal-800">{title}</h3>}
          {action}
        </div>
      )}
      <div className={bodyClass}>{children}</div>
    </div>
  )
}

export function SectionTitle({ children, sub, action }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tightish text-charcoal-900">{children}</h2>
        {sub && <p className="mt-1 text-sm text-charcoal-500">{sub}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// Buttons.
export function Button({ children, onClick, variant = 'primary', type = 'button', className = '', disabled }) {
  const variants = {
    primary:
      'bg-teal-600 text-white shadow-sm hover:bg-teal-700 active:bg-teal-800 disabled:bg-charcoal-200 disabled:text-charcoal-400 disabled:shadow-none',
    secondary:
      'bg-white text-charcoal-700 ring-1 ring-charcoal-200 hover:bg-charcoal-50 hover:ring-charcoal-300 disabled:text-charcoal-400',
    ghost: 'text-charcoal-500 hover:bg-charcoal-100 hover:text-charcoal-700',
    danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold outline-none transition-all focus-visible:shadow-focus disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// Form field wrapper.
export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-charcoal-400">{hint}</span>}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-charcoal-200 bg-white px-3 py-2 text-sm text-charcoal-800 outline-none transition-all placeholder:text-charcoal-400 focus:border-teal-500 focus:shadow-focus disabled:bg-charcoal-50 disabled:text-charcoal-400'

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
