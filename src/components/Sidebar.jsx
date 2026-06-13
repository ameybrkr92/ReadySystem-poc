import React from 'react'

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: '◧' },
  { key: 'planning', label: 'Planning', icon: '◳' },
  { key: 'purchase', label: 'Purchase', icon: '⛟' },
  { key: 'stores', label: 'Stores', icon: '▦' },
  { key: 'quality', label: 'Quality', icon: '✓' },
]

export default function Sidebar({ view, onNavigate, alertCount }) {
  return (
    <aside className="flex w-56 shrink-0 flex-col bg-charcoal-900 text-charcoal-100">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 font-bold text-white">
          RS
        </div>
        <div>
          <div className="text-sm font-bold leading-tight text-white">Ready Systems</div>
          <div className="text-[11px] leading-tight text-charcoal-400">Operations</div>
        </div>
      </div>

      <nav className="mt-2 flex-1 px-3">
        {NAV.map((item) => {
          const active = view === item.key
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-teal-500 text-white'
                  : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              <span className="w-4 text-center text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
              {item.key === 'quality' && alertCount > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {alertCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="px-5 py-4 text-[11px] text-charcoal-500">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
          One connected system
        </div>
        Wire-harness &amp; MV switchgear
      </div>
    </aside>
  )
}
