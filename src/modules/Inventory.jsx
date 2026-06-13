import React, { useState } from 'react'
import { useStore } from '../store.jsx'
import { MATERIALS, SUPPLIERS, canEdit } from '../data/seed.js'
import { Card, SectionTitle, Tag, Button, Field, Select, Input } from '../components/ui.jsx'
import { Icon } from '../components/Icons.jsx'
import Modal from '../components/Modal.jsx'
import { stockLabel } from '../lib/format.js'

function inspectionTone(v) {
  if (v === 'Accepted') return 'green'
  if (v === 'On Hold') return 'red'
  if (v === 'Pending') return 'amber'
  return 'grey'
}

function NewGRNForm({ onClose, onSubmit }) {
  const [item, setItem] = useState(MATERIALS[0].desc)
  const mat = MATERIALS.find((m) => m.desc === item)
  const [qty, setQty] = useState('')
  const [party, setParty] = useState(SUPPLIERS[2])
  const [po, setPo] = useState('')
  const [lot, setLot] = useState('')
  const [lr, setLr] = useState('')
  const [challan, setChallan] = useState('')
  const valid = Number(qty) > 0

  return (
    <Modal
      title="Record goods inward (GRN)"
      subtitle="Adds to the inward register and bumps live stock — then goes for incoming QC"
      onClose={onClose}
      wide
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!valid}
            onClick={() =>
              onSubmit({ item, qtyNum: Number(qty), unit: mat.unit, rate: mat.rate, party, po, lot, lr, challan })
            }
          >
            <Icon.check size={15} /> Save GRN
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Field label="Item">
            <Select value={item} onChange={(e) => setItem(e.target.value)}>
              {MATERIALS.map((m) => (
                <option key={m.id}>{m.desc}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label={`Quantity (${mat.unit})`}>
          <Input type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" />
        </Field>
        <Field label="Rate (₹) — from master">
          <Input value={mat.rate.toFixed(2)} disabled />
        </Field>
        <Field label="Party (supplier)">
          <Select value={party} onChange={(e) => setParty(e.target.value)}>
            {SUPPLIERS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="PO No">
          <Input value={po} onChange={(e) => setPo(e.target.value)} placeholder="PO-2026-…" />
        </Field>
        <Field label="Lot No">
          <Input value={lot} onChange={(e) => setLot(e.target.value)} placeholder="L/6/26-…" />
        </Field>
        <Field label="LR No">
          <Input value={lr} onChange={(e) => setLr(e.target.value)} placeholder="LR-…" />
        </Field>
        <div className="col-span-2">
          <Field label="Challan / Invoice No">
            <Input value={challan} onChange={(e) => setChallan(e.target.value)} placeholder="INV-…" />
          </Field>
        </div>
      </div>
    </Modal>
  )
}

function IssueForm({ orders, onClose, onSubmit }) {
  const [wo, setWo] = useState(orders[0]?.id || '')
  const [item, setItem] = useState(MATERIALS[0].desc)
  const mat = MATERIALS.find((m) => m.desc === item)
  const [qty, setQty] = useState('')
  const valid = Number(qty) > 0

  return (
    <Modal
      title="Issue material to job"
      subtitle="The thing paper can't do — every metre tied to a work order"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={!valid} onClick={() => onSubmit({ wo, item, qtyNum: Number(qty), unit: mat.unit })}>
            <Icon.check size={15} /> Issue
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Work order">
          <Select value={wo} onChange={(e) => setWo(e.target.value)}>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.id} — {o.client}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Item">
          <Select value={item} onChange={(e) => setItem(e.target.value)}>
            {MATERIALS.map((m) => (
              <option key={m.id}>{m.desc}</option>
            ))}
          </Select>
        </Field>
        <Field label={`Quantity (${mat.unit})`}>
          <Input type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" />
        </Field>
      </div>
    </Modal>
  )
}

export default function Inventory({ user }) {
  const { state, dispatch } = useStore()
  const { goodsInward, stock, issues, orders } = state
  const [modal, setModal] = useState(null) // 'grn' | 'issue' | null
  const editable = canEdit(user.role, 'inventory')

  // Lots awaiting incoming QC — the inward desk clears or holds them here.
  const pendingQC = goodsInward.filter((g) => g.inspection === 'Pending')

  function setInspection(grn, status) {
    dispatch({ type: 'SET_GRN_INSPECTION', payload: { grn, status } })
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        sub="Goods inward, incoming QC, live stock and issue-to-job — one connected register."
        action={
          editable && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setModal('issue')}>
                <Icon.plus size={16} /> Issue to job
              </Button>
              <Button onClick={() => setModal('grn')}>
                <Icon.plus size={16} /> New GRN
              </Button>
            </div>
          )
        }
      >
        Inventory
      </SectionTitle>

      {/* Incoming QC — integral to inward */}
      <Card
        title="Incoming QC"
        action={<Tag tone="teal">Inward does QC</Tag>}
      >
        {pendingQC.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-charcoal-500">
            <Icon.check size={16} /> No lots awaiting inspection — all inward material cleared.
          </div>
        ) : (
          <div className="space-y-2">
            {pendingQC.map((g) => (
              <div
                key={g.grn}
                className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2.5"
              >
                <span className="font-mono text-sm font-semibold text-charcoal-800">{g.grn}</span>
                <span className="text-sm text-charcoal-700">{g.item}</span>
                <span className="text-xs text-charcoal-500">{g.qty} · {g.party}</span>
                <Tag tone="amber">Awaiting QC</Tag>
                {editable && (
                  <span className="ml-auto flex gap-2">
                    <button
                      onClick={() => setInspection(g.grn, 'On Hold')}
                      className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Hold
                    </button>
                    <button
                      onClick={() => setInspection(g.grn, 'Accepted')}
                      className="rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-teal-700"
                    >
                      Accept → Stock
                    </button>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-xs text-charcoal-400">
          Incoming inspection happens right here at goods inward — no separate step. Held lots raise a
          dashboard alert.
        </p>
      </Card>

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
          Same columns as the bound register on the inward desk — Inspection is set right here at incoming QC.
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
            Wire shown in metres + coils (1 coil ≈ 100 m); terminals in nos. Recording a GRN or issuing to a
            job updates these instantly.
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

      {modal === 'grn' && (
        <NewGRNForm
          onClose={() => setModal(null)}
          onSubmit={(p) => {
            dispatch({ type: 'ADD_GRN', payload: { ...p, sign: user.initials } })
            setModal(null)
          }}
        />
      )}
      {modal === 'issue' && (
        <IssueForm
          orders={orders}
          onClose={() => setModal(null)}
          onSubmit={(p) => {
            dispatch({ type: 'ADD_ISSUE', payload: { ...p, sign: user.initials } })
            setModal(null)
          }}
        />
      )}
    </div>
  )
}
