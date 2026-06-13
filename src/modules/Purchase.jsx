import React from 'react'
import { useStore } from '../store.jsx'
import { SUPPLIERS } from '../data/seed.js'
import { Card, SectionTitle, Tag } from '../components/ui.jsx'
import { inr } from '../lib/format.js'

function poStatusTone(status) {
  switch (status) {
    case 'Received':
      return 'green'
    case 'Partially Received':
      return 'amber'
    case 'Pending':
      return 'red'
    default:
      return 'grey'
  }
}

export default function Purchase() {
  const { state } = useStore()
  const { purchaseOrders } = state

  const pending = purchaseOrders.filter((p) => p.status === 'Pending').length

  return (
    <div className="space-y-5">
      <SectionTitle sub="Purchase orders raised from BOMs. Suppliers below feed every PO dropdown.">
        Purchase
      </SectionTitle>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {purchaseOrders.map((po) => (
            <Card key={po.id}>
              <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-mono text-base font-bold text-charcoal-800">{po.id}</span>
                <Tag tone="teal">{po.supplier}</Tag>
                <span className="text-sm text-charcoal-500">
                  for Job <span className="font-mono">{po.wo}</span>
                </span>
                <span className="text-sm text-charcoal-400">raised {po.raisedOn}</span>
                <span className="ml-auto">
                  <Tag tone={poStatusTone(po.status)}>{po.status}</Tag>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-charcoal-100 text-left text-xs uppercase tracking-wide text-charcoal-400">
                      <th className="px-3 py-2 font-medium">Item</th>
                      <th className="px-3 py-2 text-right font-medium">Qty</th>
                      <th className="px-3 py-2 font-medium">Unit</th>
                      <th className="px-3 py-2 text-right font-medium">Rate (₹)</th>
                      <th className="px-3 py-2 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100">
                    {po.items.map((it) => (
                      <tr key={it.desc}>
                        <td className="px-3 py-2 text-charcoal-700">{it.desc}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{it.qty.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2 text-charcoal-500">{it.unit}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-charcoal-500">{it.rate.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right tabular-nums font-medium">{inr(it.qty * it.rate, false)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {po.note && (
                <div
                  className={`mt-3 flex items-start gap-2 rounded-lg p-3 text-xs ${
                    po.status === 'Pending'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  <span>⚠</span>
                  <span className="font-medium">{po.note}</span>
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="space-y-5">
          <Card title="Open issues">
            <div className="text-sm text-charcoal-600">
              <div className="mb-2 flex items-center justify-between">
                <span>Pending POs</span>
                <span className={`font-bold ${pending ? 'text-red-600' : 'text-charcoal-800'}`}>{pending}</span>
              </div>
              <p className="text-xs text-charcoal-500">
                PO-2026-0431 is the pending order delaying Job 3009628618/100 — the same shortage you see
                flagged on the dashboard.
              </p>
            </div>
          </Card>

          <Card title="Suppliers">
            <ul className="space-y-2 text-sm">
              {SUPPLIERS.map((s) => (
                <li key={s} className="flex items-center gap-2 text-charcoal-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-charcoal-400">
              These are the approved vendors available in every PO supplier dropdown.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
