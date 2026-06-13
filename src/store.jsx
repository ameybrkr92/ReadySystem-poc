import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react'
import { makeSeed, STAGES, stageIndex } from './data/seed.js'

const StoreContext = createContext(null)

// Speed presets map to tick intervals (ms). Default ~4s.
export const SPEEDS = {
  '0.5×': 8000,
  '1×': 4000,
  '2×': 2000,
  '4×': 1000,
}

let _id = 1000
const nextId = () => `e${_id++}`

function fmtClock(mins) {
  const h = Math.floor(mins / 60) % 24
  const m = Math.floor(mins % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function initState() {
  return {
    ...makeSeed(),
    clock: 10 * 60 + 40, // 10:40, where the seed feed leaves off
    playing: true,
    speed: '1×',
    toasts: [],
    advances: 0,
  }
}

// A small pool of ambient events so the feed always feels alive even when no
// order happens to change stage on a given tick.
const AMBIENT = [
  { kind: 'grn', text: 'GRN/124 received — Aviza Technologies (2.5sqmm Blue, 300m)' },
  { kind: 'qc', text: 'QC passed: PVC Insu 2.5sqmm Red lot L/4/26-09' },
  { kind: 'issue', text: 'Issued 180m 2.5sqmm Red to Job 3009611593/100' },
  { kind: 'grn', text: 'GRN/125 received — Terminal Technologies (Snap-on, 800 nos)' },
  { kind: 'qc', text: 'QC passed: PVC Sleeve 16mm lot S/6/26' },
  { kind: 'issue', text: 'Issued 640 nos Snap-on Terminal to Job 3009649896/100' },
  { kind: 'stage', text: 'Costing sheet drafted for Job 3009649896/100' },
]

// Alerts the sim can surface as toasts during the demo.
const POP_ALERTS = [
  { severity: 'amber', title: 'Approaching shortage', text: 'PVC Sleeve 16mm Black trending low — 4 jobs queued.' },
  { severity: 'red', title: 'Job stuck too long', text: 'Job 3009628618/100 in Purchase > 6 days waiting on RR Kabel.' },
  { severity: 'amber', title: 'QC re-inspection due', text: 'Lot S/3/26-02 re-inspection pending — blocks Job 3009348471/100.' },
]

function logEvent(state, kind, text) {
  const ev = { id: nextId(), kind, text, time: fmtClock(state.clock) }
  return [ev, ...state.activity].slice(0, 50)
}

function tick(state) {
  let next = { ...state }
  next.clock = state.clock + 7 + Math.floor(Math.random() * 9) // 7–15 min per tick
  next.advances = state.advances + 1
  next.orders = state.orders.map((o) => ({ ...o }))

  // Candidates that can move: on-track and not yet dispatched.
  const movable = next.orders.filter(
    (o) => o.status === 'ontrack' && stageIndex(o.stage) < STAGES.length - 1
  )

  let activity = state.activity
  let toasts = state.toasts

  if (movable.length) {
    const o = movable[Math.floor(Math.random() * movable.length)]
    o.progress = Math.min(100, o.progress + 22 + Math.floor(Math.random() * 26))
    if (o.progress >= 100) {
      const idx = stageIndex(o.stage)
      const fromStage = o.stage
      const toStage = STAGES[idx + 1]
      o.stage = toStage
      o.progress = 12 + Math.floor(Math.random() * 18)
      if (toStage === 'Dispatch') {
        o.status = 'done'
        o.progress = 100
        activity = logEvent({ ...next, activity }, 'dispatch', `Job ${o.id} dispatched — ${o.client} ✓`)
      } else {
        activity = logEvent(
          { ...next, activity },
          'stage',
          `Job ${o.id} moved ${fromStage} → ${toStage}`
        )
      }
    } else {
      // Mid-stage progress — drop an ambient event so the feed keeps moving.
      const a = AMBIENT[Math.floor(Math.random() * AMBIENT.length)]
      activity = logEvent({ ...next, activity }, a.kind, a.text)
    }
  } else {
    const a = AMBIENT[Math.floor(Math.random() * AMBIENT.length)]
    activity = logEvent({ ...next, activity }, a.kind, a.text)
  }

  // Occasionally pop an alert toast (~1 in 6 ticks).
  if (Math.random() < 0.17) {
    const pa = POP_ALERTS[Math.floor(Math.random() * POP_ALERTS.length)]
    const toast = { id: nextId(), ...pa }
    toasts = [...toasts, toast]
    activity = logEvent({ ...next, activity }, 'alert', `${pa.title}: ${pa.text}`)
  }

  next.activity = activity
  next.toasts = toasts
  return next
}

function reducer(state, action) {
  switch (action.type) {
    case 'TICK':
      return tick(state)
    case 'FAST_FORWARD': {
      let s = state
      for (let i = 0; i < 6; i++) s = tick(s)
      return s
    }
    case 'SET_PLAYING':
      return { ...state, playing: action.value }
    case 'SET_SPEED':
      return { ...state, speed: action.value }
    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) }
    case 'DISMISS_ALERT':
      return { ...state, alerts: state.alerts.filter((a) => a.id !== action.id) }
    case 'RESET':
      return initState()
    default:
      return state
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState)
  const stateRef = useRef(state)
  stateRef.current = state

  // The simulation loop — re-armed whenever play/pause or speed changes.
  useEffect(() => {
    if (!state.playing) return
    const interval = SPEEDS[state.speed] || 4000
    const t = setInterval(() => dispatch({ type: 'TICK' }), interval)
    return () => clearInterval(t)
  }, [state.playing, state.speed])

  // Auto-dismiss toasts after a few seconds.
  useEffect(() => {
    if (!state.toasts.length) return
    const timers = state.toasts.map((toast) =>
      setTimeout(() => dispatch({ type: 'DISMISS_TOAST', id: toast.id }), 5200)
    )
    return () => timers.forEach(clearTimeout)
  }, [state.toasts])

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
