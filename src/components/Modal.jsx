import React, { useEffect } from 'react'
import { Icon } from './Icons.jsx'

// Centered modal dialog with backdrop. Closes on Escape and backdrop click.
export default function Modal({ title, subtitle, onClose, children, footer, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-charcoal-950/40 p-4 backdrop-blur-sm sm:p-8">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative my-6 w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} animate-slide-in rounded-2xl border border-charcoal-200/70 bg-white shadow-pop`}
      >
        <div className="flex items-start justify-between border-b border-charcoal-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-charcoal-800">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-charcoal-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-charcoal-400 hover:bg-charcoal-50 hover:text-charcoal-700"
          >
            <Icon.close size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-charcoal-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
