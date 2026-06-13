import React, { useState } from 'react'
import { useStore } from '../store.jsx'
import { Card, SectionTitle, Tag } from '../components/ui.jsx'

function qcTone(status) {
  return status === 'pass' ? 'green' : status === 'hold' ? 'red' : 'amber'
}
const qcLabel = (s) => (s === 'pass' ? 'Pass' : s === 'hold' ? 'On hold' : 'Open')

function RecordDetail({ rec }) {
  return (
    <Card
      title={`${rec.doc} — ${rec.material}`}
      action={<Tag tone={qcTone(rec.status)}>{qcLabel(rec.status)}</Tag>}
    >
      {/* Header block — controlled-document feel */}
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-charcoal-50 p-3 text-sm sm:grid-cols-3">
        <Field label="Material" value={rec.material} />
        <Field label="GRN" value={rec.grn} />
        <Field label="Lot" value={rec.lot} />
        <Field label="Checked by" value={rec.checkedBy} />
        <Field label="Date" value={rec.date} />
        <Field label="Work order" value={rec.wo} mono />
      </div>

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
        <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700">
          ⚠ This lot is on hold — it is the QC hold blocking Job {rec.wo} on the dashboard.
        </div>
      )}
    </Card>
  )
}

function Field({ label, value, mono }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-charcoal-400">{label}</div>
      <div className={`font-medium text-charcoal-700 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}

export default function Quality({ selectedOrder }) {
  const { state } = useStore()
  const { qualityRecords } = state

  // Open the record tied to an incoming W/O, else the held one, else the first.
  const initial =
    qualityRecords.find((r) => r.wo === selectedOrder) ||
    qualityRecords.find((r) => r.status === 'hold') ||
    qualityRecords[0]
  const [selectedId, setSelectedId] = useState(initial?.id)
  const selected = qualityRecords.find((r) => r.id === selectedId) || initial

  function exportAuditPack() {
    alert(
      'Audit pack (demo)\n\n' +
        `${qualityRecords.length} inspection records for 01/02/2026 – 13/06/2026 would be exported as a single PDF — ` +
        'every QA-IQP plan, observation and sign-off, ready for a Siemens audit in one click.'
    )
  }

  return (
    <div className="space-y-5">
      <SectionTitle sub="Incoming inspection plans and records — the controlled documents your auditors ask for.">
        Quality
      </SectionTitle>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
        <Card
          title="Inspection records"
          action={
            <button
              onClick={exportAuditPack}
              className="rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-teal-700"
            >
              ⤓ Audit pack
            </button>
          }
        >
          <ul className="space-y-2">
            {qualityRecords.map((r) => {
              const active = r.id === selected?.id
              return (
                <li key={r.id}>
                  <button
                    onClick={() => setSelectedId(r.id)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      active
                        ? 'border-teal-300 bg-teal-50'
                        : 'border-charcoal-100 hover:bg-charcoal-50'
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
          </ul>
          <p className="mt-3 text-xs text-charcoal-400">
            Audit pack exports every record for a date range in one click.
          </p>
        </Card>

        {selected && <RecordDetail rec={selected} />}
      </div>
    </div>
  )
}
