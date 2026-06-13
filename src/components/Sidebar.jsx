import React from 'react'
import { Icon } from './Icons.jsx'

// Nav is grouped: Purchase & Costing sit nested under a "Planning" group,
// reflecting that they're part of the planning function. Top-level items have
// no group; grouped items render under a faint group label and are indented.
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
      className={`mb-1 flex w-full items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors ${
        nested ? 'pl-5 pr-3' : 'px-3'
      } ${active ? 'bg-teal-500 text-white' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'}`}
    >
      <IconCmp size={18} />
      <span>{item.label}</span>
      {item.key === 'dashboard' && alertCount > 0 && (
        <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {alertCount}
        </span>
      )}
    </button>
  )
}

export default function Sidebar({ view, onNavigate, alertCount, role }) {
  const visible = (key) => role.modules.includes(key)

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
        {NAV.map((item, i) => {
          if (item.group) {
            const kids = item.children.filter((c) => visible(c.key))
            if (kids.length === 0) return null
            return (
              <div key={item.group} className="mb-1 mt-3">
                <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-charcoal-500">
                  {item.group}
                </div>
                {kids.map((c) => (
                  <NavButton
                    key={c.key}
                    item={c}
                    view={view}
                    onNavigate={onNavigate}
                    alertCount={alertCount}
                    nested
                  />
                ))}
              </div>
            )
          }
          if (!visible(item.key)) return null
          return (
            <NavButton
              key={item.key}
              item={item}
              view={view}
              onNavigate={onNavigate}
              alertCount={alertCount}
            />
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
