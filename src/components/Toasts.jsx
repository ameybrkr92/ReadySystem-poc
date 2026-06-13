import React from 'react'
import { useStore } from '../store.jsx'

// Bottom-right gentle alert toasts driven by the simulation loop.
export default function Toasts() {
  const { state, dispatch } = useStore()

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-80 flex-col gap-2">
      {state.toasts.map((t) => {
        const tone =
          t.severity === 'red'
            ? 'border-l-red-500'
            : t.severity === 'amber'
              ? 'border-l-amber-500'
              : 'border-l-teal-500'
        const dot =
          t.severity === 'red' ? 'bg-red-500' : t.severity === 'amber' ? 'bg-amber-500' : 'bg-teal-500'
        return (
          <div
            key={t.id}
            className={`pointer-events-auto animate-toast-in rounded-lg border-l-4 bg-white p-3 shadow-lg ring-1 ring-charcoal-100 ${tone}`}
          >
            <div className="flex items-start gap-2">
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dot}`} />
              <div className="flex-1">
                <div className="text-sm font-semibold text-charcoal-800">{t.title}</div>
                <div className="mt-0.5 text-xs text-charcoal-500">{t.text}</div>
              </div>
              <button
                onClick={() => dispatch({ type: 'DISMISS_TOAST', id: t.id })}
                className="text-charcoal-300 hover:text-charcoal-600"
              >
                ✕
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
