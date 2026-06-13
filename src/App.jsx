import React, { useState } from 'react'
import { useStore, SPEEDS } from './store.jsx'
import Sidebar from './components/Sidebar.jsx'
import Toasts from './components/Toasts.jsx'
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
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
          state.playing
            ? 'bg-teal-600 text-white hover:bg-teal-700'
            : 'bg-amber-500 text-white hover:bg-amber-600'
        }`}
      >
        {state.playing ? '❚❚ Pause' : '▶ Play'}
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
        className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-charcoal-600 ring-1 ring-charcoal-200 hover:bg-charcoal-50"
        title="Run several advances quickly"
      >
        ⏩ Fast-forward day
      </button>

      <button
        onClick={() => dispatch({ type: 'RESET' })}
        className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-charcoal-600 ring-1 ring-charcoal-200 hover:bg-charcoal-50"
      >
        ↺ Reset demo
      </button>
    </div>
  )
}

export default function App() {
  const { state } = useStore()
  const [view, setView] = useState('dashboard')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const activeAlerts = state.alerts.length

  function navigate(v) {
    setSelectedOrder(null)
    setView(v)
  }

  // Cross-module navigation: jump to a module focused on a specific W/O.
  function openOrder(wo, targetView = 'planning') {
    setSelectedOrder(wo)
    setView(targetView)
  }

  const titles = {
    dashboard: ['Live operations', 'Watch the whole shop run from one screen'],
    planning: ['Planning & BOM', 'Siemens tracker — configs, BOM, costing milestones'],
    purchase: ['Purchase', 'Purchase orders raised from BOMs'],
    stores: ['Stores', 'Goods inward register, live stock & issue-to-job'],
    quality: ['Quality', 'Incoming inspection plans & records'],
  }
  const [title, subtitle] = titles[view]

  return (
    <div className="flex h-screen overflow-hidden bg-charcoal-50">
      <Sidebar view={view} onNavigate={navigate} alertCount={activeAlerts} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar: title, DEMO badge, clock, simulation controls */}
        <header className="flex items-center justify-between border-b border-charcoal-100 bg-white px-6 py-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-charcoal-800">{title}</h1>
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                  Demo
                </span>
              </div>
              <p className="text-xs text-charcoal-500">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 text-sm text-charcoal-500 lg:flex">
              <span
                className={`h-2 w-2 rounded-full ${state.playing ? 'animate-pulse bg-teal-500' : 'bg-charcoal-300'}`}
              />
              <span className="font-mono">
                {String(Math.floor(state.clock / 60) % 24).padStart(2, '0')}:
                {String(Math.floor(state.clock % 60)).padStart(2, '0')}
              </span>
              <span className="text-charcoal-300">·</span>
              <span>13/06/2026</span>
            </div>
            <SimControls />
          </div>
        </header>

        <main className="scroll-thin flex-1 overflow-y-auto p-6">
          {view === 'dashboard' && <Dashboard onOpenOrder={openOrder} />}
          {view === 'planning' && (
            <Planning selectedOrder={selectedOrder} onSelect={setSelectedOrder} />
          )}
          {view === 'purchase' && <Purchase />}
          {view === 'stores' && <Stores />}
          {view === 'quality' && <Quality selectedOrder={selectedOrder} />}
        </main>
      </div>

      <Toasts />
    </div>
  )
}
