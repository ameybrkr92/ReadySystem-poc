import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../store.jsx'
import { STAGES, stageIndex } from '../data/seed.js'
import StageTracker from '../components/StageTracker.jsx'
import { StatusBadge, Tag } from '../components/ui.jsx'
import { Icon } from '../components/Icons.jsx'
import { orderQuote } from '../lib/costing.js'

// Compact ₹ for KPI tiles: ₹ 12.4L / ₹ 1.2Cr.
function inrCompact(n) {
  const v = Number(n) || 0
  if (v >= 1e7) return `₹ ${(v / 1e7).toFixed(2)} Cr`
  if (v >= 1e5) return `₹ ${(v / 1e5).toFixed(1)} L`
  return `₹ ${Math.round(v).toLocaleString('en-IN')}`
}

const KPI_TONES = {
  indigo: 'bg-teal-50 text-teal-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  slate: 'bg-charcoal-100 text-charcoal-500',
}

// KPI tile: icon chip + label + big tabular number. The number gently flashes
// when it changes, so the eye catches live movement without noise.
function Kpi({ label, value, icon: IconCmp, tone = 'slate' }) {
  const prev = useRef(value)
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    if (prev.current !== value) {
      setFlash(true)
      prev.current = value
      const t = setTimeout(() => setFlash(false), 1100)
      return () => clearTimeout(t)
    }
  }, [value])

  return (
    <div className="rounded-xl border border-charcoal-200/70 bg-white px-4 py-3.5 shadow-card transition-shadow hover:shadow-cardhover">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">{label}</span>
        {IconCmp && (
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${KPI_TONES[tone]}`}>
            <IconCmp size={15} />
          </span>
        )}
      </div>
      <div className={`tnum mt-2 text-[28px] font-bold leading-none ${flash ? 'animate-flash' : ''} text-charcoal-900`}>
        {value}
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

// Roll orders up by project for portfolio-level visibility.
function projectRollup(orders) {
  const map = new Map()
  for (const o of orders) {
    const key = o.project || 'Unassigned'
    if (!map.has(key)) map.set(key, { name: key, orders: [], stuck: 0, done: 0, prog: 0, value: 0 })
    const g = map.get(key)
    g.orders.push(o)
    if (o.status === 'stuck') g.stuck += 1
    if (o.status === 'done') g.done += 1
    g.value += orderQuote(o)
    g.prog += (stageIndex(o.stage) + (o.status === 'done' ? 1 : o.progress / 100)) / STAGES.length
  }
  return [...map.values()].map((g) => ({ ...g, avg: Math.round((g.prog / g.orders.length) * 100) }))
}

export default function Dashboard({ onOpenOrder, role }) {
  const { state, dispatch } = useStore()
  const { orders, activity, alerts } = state
  const isDirector = role?.id === 'director'

  const active = orders.filter((o) => o.status !== 'done').length
  const inCosting = orders.filter((o) => o.stage === 'Costing').length
  const inBuild = orders.filter((o) => o.stage === 'Build').length
  const readyDispatch = orders.filter((o) => o.stage === 'Dispatch').length
  const stuck = orders.filter((o) => o.status === 'stuck').length
  const alertCount = alerts.length
  const projects = projectRollup(orders)

  // Stage distribution for the director matrix.
  const stageCounts = STAGES.map((s) => ({ stage: s, n: orders.filter((o) => o.stage === s).length }))
  const maxStage = Math.max(1, ...stageCounts.map((s) => s.n))

  // Director analytics: pipeline value, on-time %, ageing of stuck jobs.
  const pipelineValue = orders.filter((o) => o.status !== 'done').reduce((s, o) => s + orderQuote(o), 0)
  const onTimePct = orders.length ? Math.round(((orders.length - stuck) / orders.length) * 100) : 100
  const stuckList = orders
    .filter((o) => o.status === 'stuck')
    .sort((a, b) => (b.stuckDays || 0) - (a.stuckDays || 0))

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
      {/* LEFT: KPIs + order board */}
      <div className="space-y-5">
        <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 ${isDirector ? 'lg:grid-cols-6' : 'lg:grid-cols-5'}`}>
          <Kpi label="Active Orders" value={active} icon={Icon.dashboard} tone="indigo" />
          <Kpi label="In Costing" value={inCosting} icon={Icon.planning} tone="slate" />
          <Kpi label="In Build" value={inBuild} icon={Icon.bolt} tone="slate" />
          <Kpi label="Ready to Dispatch" value={readyDispatch} icon={Icon.purchase} tone="emerald" />
          {isDirector && <Kpi label="Stuck" value={stuck} icon={Icon.alert} tone={stuck ? 'red' : 'slate'} />}
          <Kpi label="Alerts" value={alertCount} icon={Icon.alert} tone={alertCount ? 'red' : 'slate'} />
        </div>

        {/* Director-only portfolio analytics */}
        {isDirector && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-charcoal-200/70 bg-white p-5 shadow-card">
              <div className="text-xs font-medium uppercase tracking-wide text-charcoal-400">
                Open pipeline value
              </div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-teal-700">{inrCompact(pipelineValue)}</div>
              <div className="mt-0.5 text-xs text-charcoal-400">Quoted value of orders not yet dispatched</div>
            </div>

            <div className="rounded-xl border border-charcoal-200/70 bg-white p-5 shadow-card">
              <div className="text-xs font-medium uppercase tracking-wide text-charcoal-400">On-track</div>
              <div className="mt-1 flex items-end gap-2">
                <span
                  className={`text-2xl font-bold tabular-nums ${onTimePct >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}
                >
                  {onTimePct}%
                </span>
                <span className="pb-1 text-xs text-charcoal-400">{stuck} of {orders.length} stuck</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-charcoal-100">
                <div
                  className={`h-full rounded-full ${onTimePct >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${onTimePct}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-charcoal-200/70 bg-white p-5 shadow-card">
              <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-charcoal-400">
                Stuck jobs — ageing
              </div>
              {stuckList.length === 0 ? (
                <div className="text-sm text-charcoal-500">Nothing stuck — all jobs moving.</div>
              ) : (
                <ul className="space-y-1.5">
                  {stuckList.map((o) => (
                    <li key={o.id} className="flex items-center justify-between gap-2 text-sm">
                      <button
                        onClick={() => onOpenOrder(o.id, 'planning')}
                        className="truncate font-mono text-charcoal-700 hover:text-teal-700 hover:underline"
                      >
                        {o.id}
                      </button>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          (o.stuckDays || 0) >= 5 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {o.stuckDays || 0}d at {o.stage}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Project-wise visibility */}
        <div className="rounded-xl border border-charcoal-200/70 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-charcoal-100 px-5 py-3">
            <h3 className="text-sm font-semibold text-charcoal-700">Projects</h3>
            <span className="text-xs text-charcoal-400">{projects.length} projects · project-wise view</span>
          </div>
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            {projects.map((p) => (
              <div key={p.name} className="rounded-lg border border-charcoal-100 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-charcoal-800">{p.name}</span>
                  {p.stuck > 0 ? (
                    <Tag tone="red">{p.stuck} stuck</Tag>
                  ) : p.done === p.orders.length ? (
                    <Tag tone="green">complete</Tag>
                  ) : (
                    <Tag tone="teal">on track</Tag>
                  )}
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-charcoal-500">
                  <span>{p.orders.length} orders · {p.done} done</span>
                  <span className="font-semibold text-charcoal-700">{inrCompact(p.value)}</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-charcoal-100">
                  <div
                    className={`h-full rounded-full ${p.stuck ? 'bg-amber-400' : 'bg-teal-500'}`}
                    style={{ width: `${p.avg}%` }}
                  />
                </div>
                <div className="mt-1 text-right text-[11px] text-charcoal-400">{p.avg}% through pipeline</div>
              </div>
            ))}
          </div>
        </div>

        {/* Director-only stage distribution matrix */}
        {isDirector && (
          <div className="rounded-xl border border-charcoal-200/70 bg-white shadow-card">
            <div className="border-b border-charcoal-100 px-5 py-3">
              <h3 className="text-sm font-semibold text-charcoal-700">Stage distribution</h3>
            </div>
            <div className="grid grid-cols-5 gap-3 p-4 lg:grid-cols-10">
              {stageCounts.map((s) => (
                <div key={s.stage} className="flex flex-col items-center">
                  <div className="flex h-20 w-full items-end justify-center">
                    <div
                      className={`w-6 rounded-t ${s.n ? 'bg-teal-500' : 'bg-charcoal-100'}`}
                      style={{ height: `${Math.max(6, (s.n / maxStage) * 100)}%` }}
                      title={`${s.n} order(s)`}
                    />
                  </div>
                  <div className="mt-1 text-sm font-bold tabular-nums text-charcoal-700">{s.n}</div>
                  <div className="text-center text-[9px] leading-tight text-charcoal-400">{s.stage}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-charcoal-200/70 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-charcoal-100 px-5 py-3">
            <h3 className="text-sm font-semibold text-charcoal-700">Order status board</h3>
            <span className="text-xs text-charcoal-400">{orders.length} work orders · live</span>
          </div>
          <div className="divide-y divide-charcoal-100">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => onOpenOrder(o.id, 'planning')}
                className="group block w-full px-5 py-4 text-left transition-colors hover:bg-charcoal-50"
              >
                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-mono text-sm font-bold text-charcoal-900">{o.id}</span>
                  <span className="text-sm text-charcoal-500">{o.client}</span>
                  <Tag tone="grey">{o.project}</Tag>
                  <Tag tone="teal">
                    {o.product} {o.config}
                  </Tag>
                  {o.motorised && <Tag tone="grey">Motorised</Tag>}
                  <span className="ml-auto flex items-center gap-2">
                    <StatusBadge status={o.status} />
                    <span className="text-charcoal-300 transition-colors group-hover:text-charcoal-500">
                      <Icon.chevronRight size={16} />
                    </span>
                  </span>
                </div>
                <StageTracker order={o} />
                {o.status === 'stuck' && (
                  <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700">
                    <Icon.alert size={14} />
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
        <div className="rounded-xl border border-charcoal-200/70 bg-white shadow-card">
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

        <div className="rounded-xl border border-charcoal-200/70 bg-white shadow-card">
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
