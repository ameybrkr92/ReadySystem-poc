import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../store.jsx'
import StageTracker from '../components/StageTracker.jsx'
import { StatusBadge, Tag } from '../components/ui.jsx'

// KPI tile whose number gently flashes whenever it changes — so the eye is
// drawn to movement without the dashboard feeling noisy.
function Kpi({ label, value, accent }) {
  const prev = useRef(value)
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    if (prev.current !== value) {
      setFlash(true)
      prev.current = value
      const t = setTimeout(() => setFlash(false), 1200)
      return () => clearTimeout(t)
    }
  }, [value])

  return (
    <div className="relative overflow-hidden rounded-xl bg-white px-5 py-4 shadow-sm ring-1 ring-charcoal-100">
      {flash && <div className="absolute inset-0 animate-flash" />}
      <div className="relative">
        <div className="text-xs font-medium uppercase tracking-wide text-charcoal-400">{label}</div>
        <div className={`mt-1 text-3xl font-bold tabular-nums ${accent || 'text-charcoal-800'}`}>
          {value}
        </div>
      </div>
    </div>
  )
}

function feedTone(kind) {
  switch (kind) {
    case 'alert':
      return { dot: 'bg-red-500', text: 'text-red-700' }
    case 'qc':
      return { dot: 'bg-emerald-500', text: 'text-charcoal-700' }
    case 'grn':
      return { dot: 'bg-teal-500', text: 'text-charcoal-700' }
    case 'dispatch':
      return { dot: 'bg-charcoal-500', text: 'text-charcoal-700' }
    case 'issue':
      return { dot: 'bg-amber-500', text: 'text-charcoal-700' }
    default:
      return { dot: 'bg-charcoal-300', text: 'text-charcoal-700' }
  }
}

export default function Dashboard({ onOpenOrder }) {
  const { state, dispatch } = useStore()
  const { orders, activity, alerts } = state

  const active = orders.filter((o) => o.status !== 'done').length
  const inCosting = orders.filter((o) => o.stage === 'Costing').length
  const inBuild = orders.filter((o) => o.stage === 'Build').length
  const readyDispatch = orders.filter((o) => o.stage === 'Dispatch').length
  const alertCount = alerts.length

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
      {/* LEFT: KPIs + order board */}
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Kpi label="Active Orders" value={active} accent="text-teal-700" />
          <Kpi label="In Costing" value={inCosting} />
          <Kpi label="In Build" value={inBuild} />
          <Kpi label="Ready to Dispatch" value={readyDispatch} accent="text-emerald-600" />
          <Kpi label="Alerts" value={alertCount} accent={alertCount ? 'text-red-600' : 'text-charcoal-800'} />
        </div>

        <div className="rounded-xl bg-white shadow-sm ring-1 ring-charcoal-100">
          <div className="flex items-center justify-between border-b border-charcoal-100 px-5 py-3">
            <h3 className="text-sm font-semibold text-charcoal-700">Order status board</h3>
            <span className="text-xs text-charcoal-400">{orders.length} work orders · live</span>
          </div>
          <div className="divide-y divide-charcoal-100">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => onOpenOrder(o.id, 'planning')}
                className="block w-full px-5 py-4 text-left transition-colors hover:bg-charcoal-50"
              >
                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-mono text-sm font-bold text-charcoal-800">{o.id}</span>
                  <span className="text-sm text-charcoal-500">{o.client}</span>
                  <Tag tone="teal">
                    {o.product} {o.config}
                  </Tag>
                  {o.motorised && <Tag tone="grey">Motorised</Tag>}
                  <span className="ml-auto">
                    <StatusBadge status={o.status} />
                  </span>
                </div>
                <StageTracker order={o} />
                {o.status === 'stuck' && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <span>⚠</span>
                    {o.stuckReason}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: alerts + live activity feed */}
      <div className="space-y-5">
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-charcoal-100">
          <div className="flex items-center justify-between border-b border-charcoal-100 px-5 py-3">
            <h3 className="text-sm font-semibold text-charcoal-700">Alerts</h3>
            {alertCount > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                {alertCount} active
              </span>
            )}
          </div>
          <div className="space-y-2 p-4">
            {alerts.length === 0 && (
              <div className="py-4 text-center text-sm text-charcoal-400">No active alerts</div>
            )}
            {alerts.map((a) => (
              <div
                key={a.id}
                className={`rounded-lg border-l-4 p-3 ${
                  a.severity === 'red'
                    ? 'border-l-red-500 bg-red-50'
                    : 'border-l-amber-500 bg-amber-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-charcoal-800">{a.title}</div>
                    <div className="mt-0.5 text-xs text-charcoal-600">{a.text}</div>
                    {a.wo && (
                      <button
                        onClick={() => onOpenOrder(a.wo, a.title === 'QC hold' ? 'quality' : 'planning')}
                        className="mt-1.5 text-xs font-semibold text-teal-700 hover:underline"
                      >
                        Open Job {a.wo} →
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'DISMISS_ALERT', id: a.id })}
                    className="text-charcoal-300 hover:text-charcoal-600"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm ring-1 ring-charcoal-100">
          <div className="flex items-center justify-between border-b border-charcoal-100 px-5 py-3">
            <h3 className="text-sm font-semibold text-charcoal-700">Live activity</h3>
            <span className="flex items-center gap-1.5 text-xs text-charcoal-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" />
              streaming
            </span>
          </div>
          <div className="scroll-thin max-h-[460px] overflow-y-auto p-4">
            <ul className="space-y-3">
              {activity.map((ev, i) => {
                const tone = feedTone(ev.kind)
                return (
                  <li
                    key={ev.id}
                    className={`flex gap-3 ${i === 0 ? 'animate-slide-in' : ''}`}
                  >
                    <div className="flex flex-col items-center">
                      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${tone.dot}`} />
                      {i < activity.length - 1 && <span className="mt-1 w-px flex-1 bg-charcoal-100" />}
                    </div>
                    <div className="flex-1 pb-1">
                      <div className={`text-sm leading-snug ${tone.text}`}>{ev.text}</div>
                      <div className="mt-0.5 font-mono text-[11px] text-charcoal-400">{ev.time}</div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
