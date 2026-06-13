import React, { useState } from 'react'
import { useStore } from '../store.jsx'
import { SUPPLIERS, MATERIALS, canEdit } from '../data/seed.js'
import { Card, SectionTitle, Tag, Button, Field, Select, Input } from '../components/ui.jsx'
import { Icon } from '../components/Icons.jsx'
import Modal from '../components/Modal.jsx'
import { inr } from '../lib/format.js'

function poStatusTone(status) {
  switch (status) {
    case 'Received':
      return 'green'
    case 'Partially Received':
      return 'amber'
    case 'Pending':
      return 'red'
    case 'Ordered':
      return 'teal'
    default:
      return 'grey'
  }
}

function NewPOForm({ orders, onClose, onSubmit }) {
  const [supplier, setSupplier] = useState(SUPPLIERS[0])
  const [wo, setWo] = useState(orders[0]?.id || '')
  const [lines, setLines] = useState([{ desc: MATERIALS[0].desc, qty: '', rate: MATERIALS[0].rate }])

  function setLine(i, patch) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  }
  function pickItem(i, desc) {
    const m = MATERIALS.find((x) => x.desc === desc)
    setLine(i, { desc, rate: m ? m.rate : 0 })
  }
  const total = lines.reduce((s, l) => s + (Number(l.qty) || 0) * l.rate, 0)
  const valid = lines.every((l) => Number(l.qty) > 0)

  function submit() {
    const items = lines.map((l) => {
      const m = MATERIALS.find((x) => x.desc === l.desc)
      return { desc: l.desc, qty: Number(l.qty), unit: m ? m.unit : 'nos', rate: l.rate }
    })
    onSubmit({ supplier, wo, items })
  }

  return (
    <Modal
      title="Raise purchase order"
      subtitle="Triggered from a BOM — picks suppliers and rates from the master"
      onClose={onClose}
      wide
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!valid}>
            <Icon.check size={15} /> Raise PO
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Supplier">
          <Select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
            {SUPPLIERS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="For work order">
          <Select value={wo} onChange={(e) => setWo(e.target.value)}>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.id} — {o.client}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">Line items</span>
          <Button
            variant="ghost"
            onClick={() => setLines((ls) => [...ls, { desc: MATERIALS[0].desc, qty: '', rate: MATERIALS[0].rate }])}
          >
            <Icon.plus size={15} /> Add line
          </Button>
        </div>
        <div className="space-y-2">
          {lines.map((l, i) => {
            const m = MATERIALS.find((x) => x.desc === l.desc)
            return (
              <div key={i} className="grid grid-cols-[1fr_90px_90px_90px_28px] items-center gap-2">
                <Select value={l.desc} onChange={(e) => pickItem(i, e.target.value)}>
                  {MATERIALS.map((mat) => (
                    <option key={mat.id}>{mat.desc}</option>
                  ))}
                </Select>
                <Input
                  type="number"
                  min="0"
                  placeholder="Qty"
                  value={l.qty}
                  onChange={(e) => setLine(i, { qty: e.target.value })}
                />
                <div className="text-center text-xs text-charcoal-500">{m?.unit}</div>
                <div className="text-right text-sm tabular-nums text-charcoal-600">₹{l.rate.toFixed(2)}</div>
                <button
                  onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))}
                  disabled={lines.length === 1}
                  className="text-charcoal-300 hover:text-red-500 disabled:opacity-30"
                >
                  <Icon.close size={16} />
                </button>
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex items-center justify-end gap-3 border-t border-charcoal-100 pt-3 text-sm">
          <span className="text-charcoal-500">PO value</span>
          <span className="text-base font-bold text-teal-700">{inr(total)}</span>
        </div>
      </div>
    </Modal>
  )
}

export default function Purchase({ user }) {
  const { state, dispatch } = useStore()
  const { purchaseOrders, orders } = state
  const [showForm, setShowForm] = useState(false)
  const editable = canEdit(user.role, 'purchase')

  const pending = purchaseOrders.filter((p) => p.status === 'Pending').length

  function createPO(payload) {
    dispatch({ type: 'ADD_PO', payload })
    setShowForm(false)
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        sub="Purchase orders raised from BOMs. Suppliers below feed every PO dropdown."
        action={
          editable && (
            <Button onClick={() => setShowForm(true)}>
              <Icon.plus size={16} /> New PO
            </Button>
          )
        }
      >
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
                    po.status === 'Pending' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  <Icon.alert size={15} />
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
              Approved vendors available in every PO supplier dropdown.
            </p>
          </Card>
        </div>
      </div>

      {showForm && <NewPOForm orders={orders} onClose={() => setShowForm(false)} onSubmit={createPO} />}
    </div>
  )
}
