import React from 'react'
import { useStore } from '../store.jsx'
import { Card, SectionTitle, Tag } from '../components/ui.jsx'
import { stockLabel } from '../lib/format.js'

function inspectionTone(v) {
  if (v === 'Accepted') return 'green'
  if (v === 'On Hold') return 'red'
  return 'amber'
}

export default function Stores() {
  const { state } = useStore()
  const { goodsInward, stock, issues } = state

  return (
    <div className="space-y-5">
      <SectionTitle sub="Your paper inward register, digitized — with live stock and issue-to-job, the part paper can't do.">
        Stores
      </SectionTitle>

      <Card title="Goods inward register">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-charcoal-200 text-left uppercase tracking-wide text-charcoal-400">
                <th className="px-2 py-2 font-medium">Date</th>
                <th className="px-2 py-2 font-medium">GRN No</th>
                <th className="px-2 py-2 font-medium">PO No</th>
                <th className="px-2 py-2 font-medium">Lot No</th>
                <th className="px-2 py-2 font-medium">LR No</th>
                <th className="px-2 py-2 font-medium">Party Name</th>
                <th className="px-2 py-2 font-medium">Item Description</th>
                <th className="px-2 py-2 font-medium">Challan/Inv No</th>
                <th className="px-2 py-2 text-right font-medium">Qty</th>
                <th className="px-2 py-2 text-right font-medium">Rate</th>
                <th className="px-2 py-2 font-medium">Inspection</th>
                <th className="px-2 py-2 font-medium">Remark</th>
                <th className="px-2 py-2 font-medium">Sign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100">
              {goodsInward.map((g) => (
                <tr key={g.grn} className="hover:bg-charcoal-50">
                  <td className="px-2 py-2 text-charcoal-600">{g.date}</td>
                  <td className="px-2 py-2 font-mono font-semibold text-charcoal-800">{g.grn}</td>
                  <td className="px-2 py-2 font-mono text-charcoal-500">{g.po}</td>
                  <td className="px-2 py-2 font-mono text-charcoal-500">{g.lot}</td>
                  <td className="px-2 py-2 font-mono text-charcoal-500">{g.lr}</td>
                  <td className="px-2 py-2 text-charcoal-700">{g.party}</td>
                  <td className="px-2 py-2 text-charcoal-700">{g.item}</td>
                  <td className="px-2 py-2 font-mono text-charcoal-500">{g.challan}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{g.qty}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-charcoal-500">{g.rate.toFixed(2)}</td>
                  <td className="px-2 py-2">
                    <Tag tone={inspectionTone(g.inspection)}>{g.inspection}</Tag>
                  </td>
                  <td className="px-2 py-2 text-charcoal-500">{g.remark || '—'}</td>
                  <td className="px-2 py-2 text-charcoal-600">{g.sign}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-charcoal-400">
          Same columns as the bound register on the stores desk — Inspection now links straight to Quality.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="Running stock">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal-100 text-left text-xs uppercase tracking-wide text-charcoal-400">
                  <th className="px-3 py-2 font-medium">Item</th>
                  <th className="px-3 py-2 font-medium">On hand</th>
                  <th className="px-3 py-2 font-medium">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {stock.map((s) => (
                  <tr key={s.item} className={s.low ? 'bg-amber-50/60' : ''}>
                    <td className="px-3 py-2 text-charcoal-700">{s.item}</td>
                    <td className="px-3 py-2 font-medium tabular-nums text-charcoal-800">
                      {stockLabel(s.onHand, s.unit)}
                    </td>
                    <td className="px-3 py-2">
                      {s.low ? <Tag tone="amber">Low stock</Tag> : <Tag tone="green">OK</Tag>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-charcoal-400">
            Wire shown in metres + coils (1 coil ≈ 100 m); terminals in nos. Low items drive the dashboard
            shortage alert.
          </p>
        </Card>

        <Card title="Issue to job" action={<Tag tone="teal">Paper can't do this</Tag>}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal-100 text-left text-xs uppercase tracking-wide text-charcoal-400">
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">W/O No</th>
                  <th className="px-3 py-2 font-medium">Item</th>
                  <th className="px-3 py-2 text-right font-medium">Qty</th>
                  <th className="px-3 py-2 font-medium">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {issues.map((it, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-charcoal-600">{it.date}</td>
                    <td className="px-3 py-2 font-mono font-semibold text-charcoal-800">{it.wo}</td>
                    <td className="px-3 py-2 text-charcoal-700">{it.item}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{it.qty}</td>
                    <td className="px-3 py-2 text-charcoal-600">{it.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-charcoal-400">
            Every metre and terminal tied to the work order that consumed it — full material traceability.
          </p>
        </Card>
      </div>
    </div>
  )
}
