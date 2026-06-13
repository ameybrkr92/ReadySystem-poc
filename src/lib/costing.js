// Shared BOM + costing logic so Planning (detail view) and the Dashboard
// (portfolio value) agree on the numbers. Demo figures — plausible, not exact.
import { FEEDER_LEGEND, MATERIALS, HARNESS_ITEMS, CLIENT_BOM } from '../data/seed.js'

// Parse a config string ("ME+LRRL-") into feeders + the metering option.
export function parseConfig(config) {
  const hasMetering = /ME/.test(config)
  const letters = config.replace(/ME/g, '').replace(/[^RLTKS]/gi, '').toUpperCase()
  const feeders = letters.split('').map((c, i) => ({
    pos: i + 1,
    ...(FEEDER_LEGEND[c] || { code: c, name: 'Unknown', desc: '' }),
  }))
  return { feeders, hasMetering }
}

// Components the client (Siemens) supplies / specifies.
export function buildClientBom(order) {
  const { feeders, hasMetering } = parseConfig(order.config)
  const counts = { R: 0, L: 0, ME: hasMetering ? 1 : 0, MOT: order.motorised ? feeders.length : 0, PANEL: 1 }
  feeders.forEach((f) => {
    if (f.code === 'R') counts.R += 1
    if (f.code === 'L') counts.L += 1
  })
  return CLIENT_BOM.map((c) => ({ desc: c.desc, unit: c.unit, qty: (counts[c.per] || 0) * order.qty })).filter(
    (l) => l.qty > 0
  )
}

// The wire/harness BOM Ready Systems builds from the drawings.
export function buildWireBom(order) {
  const { feeders, hasMetering } = parseConfig(order.config)
  const rings = feeders.filter((f) => f.code === 'R').length
  const breakers = feeders.filter((f) => f.code === 'L').length
  const lines = []
  const add = (descMatch, qty) => {
    const m = MATERIALS.find((x) => x.desc === descMatch)
    if (m) lines.push({ desc: m.desc, unit: m.unit, qty, rate: m.rate, amount: qty * m.rate })
  }
  add('PVC Insu HV 2.5sqmm Grey', (160 * rings + 120 * breakers) * order.qty)
  add('PVC Insu HV 2.5sqmm Red', (60 + 40 * breakers) * order.qty)
  add('PVC Insu HV 2.5sqmm Black', (60 + 30 * rings) * order.qty)
  add('PVC Insu HV 2.5sqmm Blue', 50 * order.qty)
  if (hasMetering) add('PVC Insu HV 1.5sqmm Grey', 120 * order.qty)
  add('PVC Sleeve 16mm Black', (40 + 20 * feeders.length) * order.qty)
  add('Snap-on Terminal', (120 * feeders.length + (hasMetering ? 80 : 0)) * order.qty)
  return lines
}

// Harness hardware (lugs, ferrules, ducting, ties…) identified from drawings.
export function buildHarnessAdds(order) {
  const { feeders, hasMetering } = parseConfig(order.config)
  const n = feeders.length
  const want = (desc, qty) => {
    const h = HARNESS_ITEMS.find((x) => x.desc === desc)
    return h
      ? { desc: h.desc, unit: h.unit, qty: Math.round(qty), rate: h.rate, amount: Math.round(qty) * h.rate }
      : null
  }
  return [
    want('Ring Lug 2.5sqmm', (60 * n + (hasMetering ? 40 : 0)) * order.qty),
    want('Ring Lug 1.5sqmm', (hasMetering ? 50 : 20) * order.qty),
    want('Bootlace Ferrule 2.5sqmm', 90 * n * order.qty),
    want('Bootlace Ferrule 1.5sqmm', (hasMetering ? 120 : 40) * order.qty),
    want('Wire Duct 25×40mm', (3 + 1.5 * n) * order.qty),
    want('DIN Rail 35mm', (2 + n) * order.qty),
    want('Cable Tie 100mm', 80 * n * order.qty),
    want('Heat-shrink Sleeve 6mm', (8 + 4 * n) * order.qty),
    want('Ferrule Marker', 140 * n * order.qty),
    want('Earthing Braid 6sqmm', (4 + 2 * n) * order.qty),
  ].filter(Boolean)
}

// Material cost in Ready Systems' scope (wire + harness hardware).
export function orderMaterial(order) {
  const wire = buildWireBom(order).reduce((s, l) => s + l.amount, 0)
  const harness = buildHarnessAdds(order).reduce((s, l) => s + l.amount, 0)
  return wire + harness
}

// Quote to the client: material + 35% labour + 12% overhead + 18% margin.
export function orderQuote(order) {
  return orderMaterial(order) * 1.47 * 1.18
}
