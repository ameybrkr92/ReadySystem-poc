import React, { useState } from 'react'
import { useStore } from '../store.jsx'
import { FEEDER_LEGEND, MATERIALS, canEdit } from '../data/seed.js'
import { StatusBadge, Tag, Card, SectionTitle, Button, Field, Select, Input } from '../components/ui.jsx'
import StageTracker from '../components/StageTracker.jsx'
import { Icon } from '../components/Icons.jsx'
import Modal from '../components/Modal.jsx'
import { inr, inrWhole } from '../lib/format.js'

function NewOrderForm({ onClose, onSubmit }) {
  const [id, setId] = useState('')
  const [client, setClient] = useState('')
  const [product, setProduct] = useState('8DJHST')
  const [config, setConfig] = useState('')
  const [motorised, setMotorised] = useState(false)
  const [qty, setQty] = useState('1')
  const valid = id.trim() && client.trim() && config.trim() && Number(qty) > 0

  return (
    <Modal
      title="New work order"
      subtitle="Starts at RFQ and joins the live pipeline immediately"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!valid}
            onClick={() =>
              onSubmit({ id: id.trim(), client: client.trim(), product, config: config.trim().toUpperCase(), motorised, qty: Number(qty) })
            }
          >
            <Icon.check size={15} /> Create order
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="W/O No">
          <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="3009xxxxxx/100" />
        </Field>
        <Field label="Client">
          <Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Siemens Energy India Ltd" />
        </Field>
        <Field label="Product">
          <Select value={product} onChange={(e) => setProduct(e.target.value)}>
            <option>8DJHST</option>
            <option>8FB20</option>
          </Select>
        </Field>
        <Field label="Config" hint="e.g. RRL, RRL+ME, LRRL+ME">
          <Input value={config} onChange={(e) => setConfig(e.target.value)} placeholder="RRL+ME" />
        </Field>
        <Field label="Motorised">
          <Select value={motorised ? 'yes' : 'no'} onChange={(e) => setMotorised(e.target.value === 'yes')}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </Select>
        </Field>
        <Field label="Quantity (sets)">
          <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
        </Field>
      </div>
    </Modal>
  )
}

// Parse a config string ("ME+LRRL-") into feeders + the metering option.
function parseConfig(config) {
  const hasMetering = /ME/.test(config)
  const letters = config.replace(/ME/g, '').replace(/[^RLTKS]/gi, '').toUpperCase()
  const feeders = letters.split('').map((c, i) => ({
    pos: i + 1,
    ...(FEEDER_LEGEND[c] || { code: c, name: 'Unknown', desc: '' }),
  }))
  return { feeders, hasMetering }
}

// Build a plausible (not accurate) harness BOM from the parsed config.
function buildBom(order) {
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

function OrderList({ orders, onSelect }) {
  // Status colour feel echoing their tracker (green done / amber stuck / white open).
  const rowTone = (s) =>
    s === 'done' ? 'bg-emerald-50/60' : s === 'stuck' ? 'bg-amber-50/60' : 'bg-white'

  return (
    <Card title="Siemens work-order tracker">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-charcoal-100 text-left text-xs uppercase tracking-wide text-charcoal-400">
              <th className="px-3 py-2 font-medium">W/O No</th>
              <th className="px-3 py-2 font-medium">Client</th>
              <th className="px-3 py-2 font-medium">Product</th>
              <th className="px-3 py-2 font-medium">Config</th>
              <th className="px-3 py-2 font-medium">Motorised</th>
              <th className="px-3 py-2 font-medium">Qty</th>
              <th className="px-3 py-2 font-medium">BOM → Costing</th>
              <th className="px-3 py-2 font-medium">Costing → Siemens</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100">
            {orders.map((o) => (
              <tr
                key={o.id}
                onClick={() => onSelect(o.id)}
                className={`cursor-pointer transition-colors hover:bg-teal-50 ${rowTone(o.status)}`}
              >
                <td className="px-3 py-2.5 font-mono font-semibold text-charcoal-800">{o.id}</td>
                <td className="px-3 py-2.5 text-charcoal-600">{o.client}</td>
                <td className="px-3 py-2.5">{o.product}</td>
                <td className="px-3 py-2.5 font-medium text-charcoal-700">{o.config}</td>
                <td className="px-3 py-2.5">{o.motorised ? 'Yes' : 'No'}</td>
                <td className="px-3 py-2.5">{o.qty}</td>
                <td className="px-3 py-2.5 text-charcoal-500">{o.bomToCosting}</td>
                <td className="px-3 py-2.5 text-charcoal-500">{o.costingToSiemens}</td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-charcoal-400">Click any work order to open its BOM &amp; costing.</p>
    </Card>
  )
}

function OrderDetail({ order, onBack }) {
  const { feeders, hasMetering } = parseConfig(order.config)
  const bom = buildBom(order)
  const material = bom.reduce((s, l) => s + l.amount, 0)
  const labour = material * 0.35
  const overhead = material * 0.12
  const subtotal = material + labour + overhead
  const margin = subtotal * 0.18
  const quote = subtotal + margin

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-sm font-semibold text-teal-700 hover:underline">
        ← Back to tracker
      </button>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 className="font-mono text-2xl font-bold text-charcoal-800">{order.id}</h2>
        <Tag tone="teal">
          {order.product} {order.config}
        </Tag>
        {order.motorised && <Tag tone="grey">Motorised</Tag>}
        <StatusBadge status={order.status} />
        <span className="text-charcoal-500">{order.client}</span>
      </div>

      <Card title="Pipeline">
        <StageTracker order={order} />
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title={`Configuration parse · "${order.config}"`}>
          <div className="space-y-2">
            {feeders.map((f) => (
              <div key={f.pos} className="flex items-center gap-3 rounded-lg bg-charcoal-50 px-3 py-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-600 text-sm font-bold text-white">
                  {f.code}
                </span>
                <div>
                  <div className="text-sm font-semibold text-charcoal-800">
                    Feeder {f.pos}: {f.name}
                  </div>
                  <div className="text-xs text-charcoal-500">{f.desc}</div>
                </div>
              </div>
            ))}
            {hasMetering && (
              <div className="flex items-center gap-3 rounded-lg bg-teal-50 px-3 py-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-500 text-xs font-bold text-white">
                  ME
                </span>
                <div className="text-sm font-semibold text-charcoal-800">Metering panel included</div>
              </div>
            )}
            <p className="pt-1 text-xs text-charcoal-400">
              Legend: R Ring-main · L Circuit-breaker · T Transformer · K Cable · S Sectionalizer · ME Metering
            </p>
          </div>
        </Card>

        <Card title="Date milestones">
          <div className="space-y-3">
            <Milestone label="BOM sent to costing" value={order.bomToCosting} />
            <Milestone label="Costing sheet sent to Siemens" value={order.costingToSiemens} />
          </div>
          <div className="mt-4 rounded-lg bg-charcoal-50 p-3 text-xs text-charcoal-500">
            These echo the two columns the team tracks in their Siemens sheet — now updated automatically
            as the order moves through the pipeline.
          </div>
        </Card>
      </div>

      <Card title="Sample harness BOM" action={<span className="text-xs text-charcoal-400">Qty × {order.qty} sets</span>}>
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
              {bom.map((l) => (
                <tr key={l.desc}>
                  <td className="px-3 py-2 text-charcoal-700">{l.desc}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{l.qty.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-2 text-charcoal-500">{l.unit}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-charcoal-500">{l.rate.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">{inr(l.amount, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Costing summary">
        <div className="mx-auto max-w-md space-y-2 text-sm">
          <Row label="Material" value={inr(material)} />
          <Row label="Labour (35%)" value={inr(labour)} />
          <Row label="Overhead (12%)" value={inr(overhead)} />
          <div className="my-1 border-t border-charcoal-100" />
          <Row label="Sub-total" value={inr(subtotal)} bold />
          <Row label="Margin (18%)" value={inr(margin)} />
          <div className="my-1 border-t border-charcoal-200" />
          <div className="flex items-center justify-between rounded-lg bg-teal-50 px-3 py-2.5">
            <span className="font-semibold text-teal-900">Quote to Siemens</span>
            <span className="text-lg font-bold text-teal-700">{inrWhole(quote)}</span>
          </div>
          <p className="pt-2 text-center text-xs text-charcoal-400">
            Indicative demo figures — not a costing engine.
          </p>
        </div>
      </Card>
    </div>
  )
}

function Milestone({ label, value }) {
  const set = value && value !== '—'
  return (
    <div className="flex items-center justify-between rounded-lg border border-charcoal-100 px-3 py-2.5">
      <span className="text-sm text-charcoal-600">{label}</span>
      <span className={`text-sm font-semibold ${set ? 'text-teal-700' : 'text-charcoal-300'}`}>
        {set ? value : 'Pending'}
      </span>
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? 'font-semibold text-charcoal-700' : 'text-charcoal-500'}>{label}</span>
      <span className={`tabular-nums ${bold ? 'font-semibold text-charcoal-800' : 'text-charcoal-700'}`}>
        {value}
      </span>
    </div>
  )
}

export default function Planning({ selectedOrder, onSelect, user }) {
  const { state, dispatch } = useStore()
  const order = state.orders.find((o) => o.id === selectedOrder)
  const [showForm, setShowForm] = useState(false)
  const editable = canEdit(user.role, 'planning')

  return (
    <div>
      <SectionTitle
        sub="The same work orders you see on the dashboard — open one for its parsed config, BOM and costing."
        action={
          editable &&
          !order && (
            <Button onClick={() => setShowForm(true)}>
              <Icon.plus size={16} /> New work order
            </Button>
          )
        }
      >
        Planning &amp; BOM
      </SectionTitle>
      {order ? (
        <OrderDetail order={order} onBack={() => onSelect(null)} />
      ) : (
        <OrderList orders={state.orders} onSelect={onSelect} />
      )}

      {showForm && (
        <NewOrderForm
          onClose={() => setShowForm(false)}
          onSubmit={(payload) => {
            dispatch({ type: 'ADD_ORDER', payload })
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}
