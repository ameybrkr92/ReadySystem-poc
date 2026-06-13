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

// Today's date in DD/MM/YYYY for new entries.
function today() {
  return '13/06/2026'
}

// Next sequential id from a list, given a prefix and how to read the number.
function nextSeq(list, getNum, prefix, pad) {
  const max = list.reduce((m, x) => Math.max(m, getNum(x) || 0), 0)
  return `${prefix}${String(max + 1).padStart(pad, '0')}`
}

// Increase/decrease on-hand for a stock item and recompute its low flag.
function adjustStock(stock, itemDesc, delta) {
  return stock.map((s) => {
    if (s.item !== itemDesc) return s
    const onHand = Math.max(0, s.onHand + delta)
    return { ...s, onHand, low: onHand < (s.reorder ?? 0) }
  })
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

    // ---- Data entry (forms in the modules write here) -------------------
    case 'ADD_ORDER': {
      const p = action.payload
      const order = {
        id: p.id,
        client: p.client,
        product: p.product,
        config: p.config,
        motorised: p.motorised,
        qty: p.qty,
        stage: 'RFQ',
        status: 'ontrack',
        progress: 8,
        stuckReason: null,
        bomToCosting: '—',
        costingToSiemens: '—',
      }
      return {
        ...state,
        orders: [...state.orders, order],
        activity: logEvent(state, 'stage', `New work order ${p.id} created — ${p.client} (${p.product} ${p.config})`),
      }
    }

    case 'ADD_PO': {
      const p = action.payload
      const id = nextSeq(
        state.purchaseOrders,
        (po) => parseInt((po.id.match(/(\d+)$/) || [])[1], 10),
        'PO-2026-',
        4
      )
      const po = {
        id,
        supplier: p.supplier,
        wo: p.wo,
        raisedOn: today(),
        status: 'Ordered',
        note: null,
        items: p.items,
      }
      return {
        ...state,
        purchaseOrders: [po, ...state.purchaseOrders],
        activity: logEvent(state, 'stage', `${id} raised — ${p.supplier} for Job ${p.wo}`),
      }
    }

    case 'ADD_GRN': {
      const p = action.payload
      const grnNo = nextSeq(
        state.goodsInward,
        (g) => parseInt((g.grn.match(/(\d+)/) || [])[1], 10),
        'GRN/',
        3
      )
      const row = {
        date: today(),
        grn: grnNo,
        po: p.po || '—',
        lot: p.lot || '—',
        lr: p.lr || '—',
        party: p.party,
        item: p.item,
        challan: p.challan || '—',
        qty: `${p.qtyNum} ${p.unit}`,
        rate: p.rate,
        inspection: 'Pending',
        remark: p.remark || 'Awaiting incoming QC',
        sign: p.sign,
      }
      return {
        ...state,
        goodsInward: [row, ...state.goodsInward],
        stock: adjustStock(state.stock, p.item, p.qtyNum),
        activity: logEvent(state, 'grn', `${grnNo} received — ${p.party} (${p.item}, ${p.qtyNum} ${p.unit})`),
      }
    }

    case 'ADD_ISSUE': {
      const p = action.payload
      const row = {
        date: today(),
        wo: p.wo,
        item: p.item,
        qty: `${p.qtyNum} ${p.unit}`,
        by: p.sign,
      }
      return {
        ...state,
        issues: [row, ...state.issues],
        stock: adjustStock(state.stock, p.item, -p.qtyNum),
        activity: logEvent(state, 'issue', `Issued ${p.qtyNum} ${p.unit} ${p.item} to Job ${p.wo}`),
      }
    }

    // Incoming QC performed in Inventory — clear or hold an inward lot.
    case 'SET_GRN_INSPECTION': {
      const { grn, status } = action.payload
      const row = state.goodsInward.find((g) => g.grn === grn)
      const goodsInward = state.goodsInward.map((g) =>
        g.grn === grn
          ? { ...g, inspection: status, remark: status === 'On Hold' ? 'Held at incoming QC' : 'Cleared at incoming QC' }
          : g
      )
      const ev =
        status === 'On Hold'
          ? logEvent(state, 'alert', `Incoming QC HOLD: ${grn}${row ? ` (${row.item})` : ''}`)
          : logEvent(state, 'qc', `Incoming QC passed: ${grn}${row ? ` (${row.item})` : ''}`)
      return { ...state, goodsInward, activity: ev }
    }

    case 'ADD_INSPECTION': {
      const p = action.payload
      const isFinal = p.qcType === 'final'
      const id = nextSeq(
        state.qualityRecords.filter((r) => r.qcType === p.qcType),
        (r) => parseInt((r.id.match(/(\d+)/) || [])[1], 10),
        isFinal ? 'FQC-' : 'IQP-',
        4
      )
      const rec = {
        id,
        qcType: p.qcType,
        doc: p.doc,
        material: p.material,
        grn: p.grn || '—',
        lot: p.lot || '—',
        checkedBy: p.checkedBy,
        date: today(),
        status: p.status,
        wo: p.wo || '—',
        disposition: p.disposition,
        parameters: p.parameters || [],
      }
      const ev =
        p.status === 'hold'
          ? logEvent(state, 'alert', `${isFinal ? 'Final' : 'Incoming'} QC HOLD: ${p.material} (${id})`)
          : logEvent(state, 'qc', `${isFinal ? 'Final' : 'Incoming'} QC passed: ${p.material} (${id})`)
      return {
        ...state,
        qualityRecords: [rec, ...state.qualityRecords],
        activity: ev,
      }
    }

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
