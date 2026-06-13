import React, { useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import { canEdit } from '../data/seed.js'
import { Card, SectionTitle, Tag, Button, Field, Select, Input } from '../components/ui.jsx'
import { Icon } from '../components/Icons.jsx'
import Modal from '../components/Modal.jsx'

function qcTone(status) {
  return status === 'pass' ? 'green' : status === 'hold' ? 'red' : 'amber'
}
const qcLabel = (s) => (s === 'pass' ? 'Pass' : s === 'hold' ? 'On hold' : 'Open')

function Field2({ label, value, mono }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-charcoal-400">{label}</div>
      <div className={`font-medium text-charcoal-700 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}

function RecordDetail({ rec }) {
  return (
    <Card
      title={`${rec.doc} — ${rec.material}`}
      action={
        <div className="flex items-center gap-2">
          <Tag tone={rec.qcType === 'final' ? 'teal' : 'grey'}>
            {rec.qcType === 'final' ? 'Final / pre-dispatch' : 'Incoming'}
          </Tag>
          <Tag tone={qcTone(rec.status)}>{qcLabel(rec.status)}</Tag>
        </div>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-charcoal-50 p-3 text-sm sm:grid-cols-3">
        <Field2 label="Material" value={rec.material} />
        <Field2 label="GRN" value={rec.grn} />
        <Field2 label="Lot / WO" value={rec.lot} />
        <Field2 label="Checked by" value={rec.checkedBy} />
        <Field2 label="Date" value={rec.date} />
        <Field2 label="Work order" value={rec.wo} mono />
      </div>

      {rec.parameters.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal-200 text-left text-xs uppercase tracking-wide text-charcoal-400">
                <th className="px-3 py-2 font-medium">Parameter</th>
                <th className="px-3 py-2 font-medium">Spec</th>
                <th className="px-3 py-2 font-medium">Method</th>
                <th className="px-3 py-2 font-medium">Frequency</th>
                <th className="px-3 py-2 font-medium">Observation</th>
                <th className="px-3 py-2 font-medium">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100">
              {rec.parameters.map((p) => (
                <tr key={p.param} className={p.pass ? '' : 'bg-red-50/60'}>
                  <td className="px-3 py-2 font-medium text-charcoal-700">{p.param}</td>
                  <td className="px-3 py-2 text-charcoal-600">{p.spec}</td>
                  <td className="px-3 py-2 text-charcoal-500">{p.method}</td>
                  <td className="px-3 py-2 text-charcoal-500">{p.frequency}</td>
                  <td className="px-3 py-2 tabular-nums text-charcoal-700">{p.observation}</td>
                  <td className="px-3 py-2">
                    <Tag tone={p.pass ? 'green' : 'red'}>{p.pass ? 'OK' : 'Fail'}</Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-charcoal-200 p-4 text-center text-sm text-charcoal-400">
          Summary inspection — disposition recorded below.
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-charcoal-100 p-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-charcoal-400">Disposition</div>
          <div className="text-sm font-semibold text-charcoal-800">{rec.disposition}</div>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <div className="text-xs text-charcoal-400">Prepared by</div>
            <div className="font-medium text-charcoal-700">{rec.checkedBy}</div>
          </div>
          <div>
            <div className="text-xs text-charcoal-400">Approved by</div>
            <div className="font-medium text-charcoal-700">QA Head</div>
          </div>
        </div>
      </div>

      {rec.status === 'hold' && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700">
          <Icon.alert size={15} />
          {rec.qcType === 'final'
            ? `Final inspection hold — blocking dispatch of Job ${rec.wo} (shown on the dashboard).`
            : `Incoming lot on hold — flagged against Job ${rec.wo}.`}
        </div>
      )}
    </Card>
  )
}

function NewInspectionForm({ orders, onClose, onSubmit }) {
  const [qcType, setQcType] = useState('incoming')
  const [material, setMaterial] = useState('')
  const [grn, setGrn] = useState('')
  const [lot, setLot] = useState('')
  const [wo, setWo] = useState(orders[0]?.id || '')
  const [status, setStatus] = useState('pass')

  const doc = qcType === 'final' ? 'QA-FQP-002 Rev 4' : 'QA-IQP-004 Rev 6'
  const dispositions =
    status === 'pass'
      ? qcType === 'final'
        ? ['Accept → Dispatch']
        : ['Accept → Stores']
      : ['Rework', 'Return to supplier', 'Scrap']
  const [disposition, setDisposition] = useState(dispositions[0])

  // Keep disposition valid when type/result changes.
  React.useEffect(() => {
    setDisposition(dispositions[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qcType, status])

  const valid = material.trim().length > 0

  return (
    <Modal
      title="New inspection record"
      subtitle="Record an incoming-material or final pre-dispatch inspection"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!valid}
            onClick={() =>
              onSubmit({
                qcType,
                doc,
                material,
                grn: qcType === 'incoming' ? grn : '—',
                lot: qcType === 'incoming' ? lot : `WO ${wo}`,
                wo,
                status,
                disposition,
              })
            }
          >
            <Icon.check size={15} /> Save record
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-charcoal-500">Gate</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['incoming', 'Incoming (material)'],
              ['final', 'Final (pre-dispatch)'],
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setQcType(val)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  qcType === val ? 'border-teal-400 bg-teal-50 text-teal-800' : 'border-charcoal-200 text-charcoal-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Field label={qcType === 'final' ? 'Assembly / panel' : 'Material'}>
          <Input
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder={qcType === 'final' ? 'Assembled panel — 8DJHST …' : 'PVC Insu HV 2.5sqmm Grey'}
          />
        </Field>

        {qcType === 'incoming' ? (
          <div className="grid grid-cols-2 gap-4">
            <Field label="GRN No">
              <Input value={grn} onChange={(e) => setGrn(e.target.value)} placeholder="GRN/…" />
            </Field>
            <Field label="Lot No">
              <Input value={lot} onChange={(e) => setLot(e.target.value)} placeholder="L/6/26-…" />
            </Field>
          </div>
        ) : (
          <Field label="Work order">
            <Select value={wo} onChange={(e) => setWo(e.target.value)}>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} — {o.client}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Result">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pass">Pass</option>
              <option value="hold">Hold</option>
            </Select>
          </Field>
          <Field label="Disposition">
            <Select value={disposition} onChange={(e) => setDisposition(e.target.value)}>
              {dispositions.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>
        </div>
      </div>
    </Modal>
  )
}

export default function Quality({ selectedOrder, user }) {
  const { state, dispatch } = useStore()
  const { qualityRecords, orders } = state
  const editable = canEdit(user.role, 'quality')

  const [tab, setTab] = useState('incoming')
  const [showForm, setShowForm] = useState(false)

  const records = useMemo(() => qualityRecords.filter((r) => r.qcType === tab), [qualityRecords, tab])

  // Pick a sensible default record for the active tab.
  const initial =
    records.find((r) => r.wo === selectedOrder) || records.find((r) => r.status === 'hold') || records[0]
  const [selectedId, setSelectedId] = useState(initial?.id)
  const selected = records.find((r) => r.id === selectedId) || initial

  // When the tab changes, keep selection inside the tab.
  React.useEffect(() => {
    setSelectedId(initial?.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  function exportAuditPack() {
    alert(
      'Audit pack (demo)\n\n' +
        `${qualityRecords.length} inspection records (incoming + final) for 01/02/2026 – 13/06/2026 would be ` +
        'exported as a single PDF — every QA plan, observation and sign-off, ready for a Siemens audit in one click.'
    )
  }

  const counts = {
    incoming: qualityRecords.filter((r) => r.qcType === 'incoming').length,
    final: qualityRecords.filter((r) => r.qcType === 'final').length,
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        sub="Two QC gates — incoming material, and final inspection after assembly before dispatch."
        action={
          <div className="flex gap-2">
            {editable && (
              <Button onClick={() => setShowForm(true)}>
                <Icon.plus size={16} /> New inspection
              </Button>
            )}
            <Button variant="secondary" onClick={exportAuditPack}>
              <Icon.download size={16} /> Audit pack
            </Button>
          </div>
        }
      >
        Quality
      </SectionTitle>

      {/* QC gate tabs */}
      <div className="flex gap-1 rounded-lg bg-charcoal-100 p-1 sm:w-fit">
        {[
          ['incoming', 'Incoming (at goods inward)'],
          ['final', 'Final (after assembly)'],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
              tab === val ? 'bg-white text-charcoal-800 shadow-sm' : 'text-charcoal-500 hover:text-charcoal-700'
            }`}
          >
            {label}
            <span className="rounded-full bg-charcoal-200 px-1.5 text-xs text-charcoal-600">{counts[val]}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
        <Card title={tab === 'final' ? 'Final inspection records' : 'Incoming inspection records'}>
          <ul className="space-y-2">
            {records.map((r) => {
              const active = r.id === selected?.id
              return (
                <li key={r.id}>
                  <button
                    onClick={() => setSelectedId(r.id)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      active ? 'border-teal-300 bg-teal-50' : 'border-charcoal-100 hover:bg-charcoal-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold text-charcoal-800">{r.id}</span>
                      <Tag tone={qcTone(r.status)}>{qcLabel(r.status)}</Tag>
                    </div>
                    <div className="mt-0.5 text-xs text-charcoal-600">{r.material}</div>
                    <div className="mt-0.5 text-[11px] text-charcoal-400">
                      {r.doc} · {r.date}
                    </div>
                  </button>
                </li>
              )
            })}
            {records.length === 0 && (
              <li className="py-6 text-center text-sm text-charcoal-400">No records yet.</li>
            )}
          </ul>
        </Card>

        {selected ? (
          <RecordDetail rec={selected} />
        ) : (
          <Card>
            <div className="py-10 text-center text-sm text-charcoal-400">Select a record to view it.</div>
          </Card>
        )}
      </div>

      {showForm && (
        <NewInspectionForm
          orders={orders}
          onClose={() => setShowForm(false)}
          onSubmit={(p) => {
            dispatch({ type: 'ADD_INSPECTION', payload: { ...p, checkedBy: user.name } })
            setTab(p.qcType)
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}
