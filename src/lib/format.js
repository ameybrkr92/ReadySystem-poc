import { COIL_METRES } from '../data/seed.js'

// Indian rupee formatting with grouping (₹ 1,23,456.78).
export function inr(n, withSymbol = true) {
  const num = Number(n) || 0
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return withSymbol ? `₹ ${formatted}` : formatted
}

// Whole-rupee variant for big summary numbers.
export function inrWhole(n) {
  const num = Math.round(Number(n) || 0)
  return `₹ ${num.toLocaleString('en-IN')}`
}

// Wire on-hand shown as "metres + coils"; everything else in its own unit.
export function stockLabel(onHand, unit) {
  if (unit === 'm') {
    const coils = (onHand / COIL_METRES).toFixed(1)
    return `${onHand} m · ${coils} coils`
  }
  return `${onHand.toLocaleString('en-IN')} ${unit}`
}
