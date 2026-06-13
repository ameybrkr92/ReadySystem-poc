import React from 'react'
import { Icon } from './Icons.jsx'

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: Icon.dashboard },
  {
    group: 'Planning',
    children: [
      { key: 'planning', label: 'Planning & BOM', icon: Icon.planning },
      { key: 'purchase', label: 'Purchase & Costing', icon: Icon.purchase },
    ],
  },
  { key: 'inventory', label: 'Inventory', icon: Icon.stores },
  { key: 'quality', label: 'Quality', icon: Icon.quality },
]

function NavButton({ item, view, onNavigate, alertCount, nested }) {
  const active = view === item.key
  const IconCmp = item.icon
  return (
    <button
      onClick={() => onNavigate(item.key)}
      className={`group relative mb-0.5 flex w-full items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors ${
        nested ? 'pl-9 pr-3' : 'px-3'
      } ${
        active
          ? 'bg-white/10 text-white'
          : 'text-charcoal-400 hover:bg-white/5 hover:text-charcoal-100'
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-teal-400" />
      )}
      <IconCmp size={18} className={active ? 'text-teal-300' : 'text-charcoal-500 group-hover:text-charcoal-300'} />
      <span>{item.label}</span>
      {item.key === 'dashboard' && alertCount > 0 && (
        <span className="ml-auto rounded-full bg-red-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {alertCount}
        </span>
      )}
    </button>
  )
}

export default function Sidebar({ view, onNavigate, alertCount, role }) {
  const visible = (key) => role.modules.includes(key)

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-white/5 bg-charcoal-950 text-charcoal-100">
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-sm font-extrabold text-white shadow-lg shadow-teal-950/50">
          RS
        </div>
        <div>
          <div className="font-display text-sm font-bold leading-tight text-white">Ready Systems</div>
          <div className="text-[11px] leading-tight text-charcoal-500">Operations Cloud</div>
        </div>
      </div>

      <nav className="mt-3 flex-1 px-3">
        {NAV.map((item) => {
          if (item.group) {
            const kids = item.children.filter((c) => visible(c.key))
            if (kids.length === 0) return null
            return (
              <div key={item.group} className="mb-1 mt-4">
                <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-charcoal-600">
                  {item.group}
                </div>
                {kids.map((c) => (
                  <NavButton key={c.key} item={c} view={view} onNavigate={onNavigate} alertCount={alertCount} nested />
                ))}
              </div>
            )
          }
          if (!visible(item.key)) return null
          return (
            <NavButton key={item.key} item={item} view={view} onNavigate={onNavigate} alertCount={alertCount} />
          )
        })}
      </nav>

      <div className="border-t border-white/5 px-5 py-4">
        <div className="flex items-center gap-2 text-[11px] text-charcoal-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
          </span>
          Live · one connected system
        </div>
        <div className="mt-1 text-[11px] text-charcoal-600">Wire-harness &amp; MV switchgear</div>
      </div>
    </aside>
  )
}
