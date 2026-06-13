import React, { useState } from 'react'
import { useStore, SPEEDS } from './store.jsx'
import { ROLES } from './data/seed.js'
import { Icon } from './components/Icons.jsx'
import Sidebar from './components/Sidebar.jsx'
import Toasts from './components/Toasts.jsx'
import Login from './components/Login.jsx'
import Dashboard from './modules/Dashboard.jsx'
import Planning from './modules/Planning.jsx'
import Purchase from './modules/Purchase.jsx'
import Stores from './modules/Stores.jsx'
import Quality from './modules/Quality.jsx'

function SimControls() {
  const { state, dispatch } = useStore()
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => dispatch({ type: 'SET_PLAYING', value: !state.playing })}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition-colors ${
          state.playing ? 'bg-teal-600 hover:bg-teal-700' : 'bg-amber-500 hover:bg-amber-600'
        }`}
      >
        {state.playing ? <Icon.pause size={15} /> : <Icon.play size={15} />}
        {state.playing ? 'Pause' : 'Play'}
      </button>

      <div className="flex items-center overflow-hidden rounded-lg ring-1 ring-charcoal-200">
        {Object.keys(SPEEDS).map((s) => (
          <button
            key={s}
            onClick={() => dispatch({ type: 'SET_SPEED', value: s })}
            className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              state.speed === s ? 'bg-charcoal-700 text-white' : 'bg-white text-charcoal-500 hover:bg-charcoal-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <button
        onClick={() => dispatch({ type: 'FAST_FORWARD' })}
        className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-charcoal-600 ring-1 ring-charcoal-200 hover:bg-charcoal-50"
        title="Run several advances quickly"
      >
        <Icon.forward size={15} /> Fast-forward
      </button>

      <button
        onClick={() => dispatch({ type: 'RESET' })}
        className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-charcoal-600 ring-1 ring-charcoal-200 hover:bg-charcoal-50"
      >
        <Icon.reset size={15} /> Reset
      </button>
    </div>
  )
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const role = ROLES[user.role]
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-charcoal-50"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-charcoal-700 text-xs font-bold text-white">
          {user.initials}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-xs font-semibold leading-tight text-charcoal-800">{user.name}</span>
          <span className="block text-[11px] leading-tight text-charcoal-500">{role.label}</span>
        </span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-charcoal-100 bg-white py-1 shadow-lg">
            <div className="border-b border-charcoal-100 px-3 py-2">
              <div className="text-sm font-semibold text-charcoal-800">{user.name}</div>
              <div className="text-xs text-charcoal-500">{role.label}</div>
            </div>
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-charcoal-600 hover:bg-charcoal-50"
            >
              <Icon.logout size={16} /> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function App() {
  const { state } = useStore()
  const [user, setUser] = useState(null)
  const [view, setView] = useState('dashboard')
  const [selectedOrder, setSelectedOrder] = useState(null)

  if (!user) return <Login onLogin={(u) => { setUser(u); setView('dashboard') }} />

  const role = ROLES[user.role]
  const activeAlerts = state.alerts.length

  function navigate(v) {
    setSelectedOrder(null)
    setView(v)
  }

  // Cross-module navigation: jump to a module focused on a specific W/O —
  // but only if this role can see that module, else stay on dashboard.
  function openOrder(wo, targetView = 'planning') {
    const dest = role.modules.includes(targetView) ? targetView : 'dashboard'
    setSelectedOrder(wo)
    setView(dest)
  }

  const titles = {
    dashboard: ['Live operations', 'Watch the whole shop run from one screen'],
    planning: ['Planning & BOM', 'Siemens tracker — configs, BOM, costing milestones'],
    purchase: ['Purchase', 'Purchase orders raised from BOMs'],
    stores: ['Stores', 'Goods inward register, live stock & issue-to-job'],
    quality: ['Quality', 'Incoming & final inspection — plans and records'],
  }
  const [title, subtitle] = titles[view]

  return (
    <div className="flex h-screen overflow-hidden bg-charcoal-50">
      <Sidebar view={view} onNavigate={navigate} alertCount={activeAlerts} role={role} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-4 border-b border-charcoal-100 bg-white px-6 py-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-charcoal-800">{title}</h1>
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                Demo
              </span>
            </div>
            <p className="text-xs text-charcoal-500">{subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-sm text-charcoal-500 xl:flex">
              <span className={`h-2 w-2 rounded-full ${state.playing ? 'animate-pulse bg-teal-500' : 'bg-charcoal-300'}`} />
              <span className="font-mono">
                {String(Math.floor(state.clock / 60) % 24).padStart(2, '0')}:
                {String(Math.floor(state.clock % 60)).padStart(2, '0')}
              </span>
              <span className="text-charcoal-300">·</span>
              <span>13/06/2026</span>
            </div>
            <SimControls />
            <div className="h-7 w-px bg-charcoal-200" />
            <UserMenu user={user} onLogout={() => setUser(null)} />
          </div>
        </header>

        <main className="scroll-thin flex-1 overflow-y-auto p-6">
          {view === 'dashboard' && <Dashboard onOpenOrder={openOrder} role={role} />}
          {view === 'planning' && (
            <Planning selectedOrder={selectedOrder} onSelect={setSelectedOrder} user={user} />
          )}
          {view === 'purchase' && <Purchase user={user} />}
          {view === 'stores' && <Stores user={user} />}
          {view === 'quality' && <Quality selectedOrder={selectedOrder} user={user} />}
        </main>
      </div>

      <Toasts />
    </div>
  )
}
