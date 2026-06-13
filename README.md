# Ready Systems — Live Operations Demo

A clickable, **living** demo of a domain-specific ERP for **Ready Systems**, a
wire-harness & panel contract-assembly shop building medium-voltage switchgear
for Siemens.

The purpose is a **walkthrough demo**: *"sit at home and watch the whole shop
run."* Orders move through stages on their own, KPIs tick, alerts pop, and the
activity feed scrolls — then you click into any of four modules and see the same
orders, the shop's own register columns, and its QA documents.

> This is a demo. Data is **realistic-but-simulated** — recognisable W/O numbers,
> suppliers, rates and register columns, but plausible (not accounting-accurate)
> costs. A **DEMO** badge is shown in the header.

## Run it

```bash
npm install
npm run dev
```

Opens at <http://localhost:5173> on a desktop/laptop browser.

## What you'll see

- **Dashboard (the hero)** — live KPI strip, an order status board with a
  `RFQ → Final BOM → Costing → Quote → PO → Purchase → Stores → Build → QC → Dispatch`
  tracker per order (completed = teal, current = highlighted, stuck = pulsing red),
  and a right rail with alerts + a streaming activity feed.
  - The simulation advances every few seconds on its own. Use **Play/Pause**,
    the **speed** selector (0.5×–4×), **Fast-forward day**, and **Reset demo**.
- **Planning & BOM** — the Siemens work-order tracker; open an order to see its
  config parsed into feeders, a sample harness BOM, a costing summary, and the
  "BOM sent to costing" / "Costing sheet sent to Siemens" milestones.
- **Purchase** — POs raised from BOMs with real suppliers; one pending PO is
  flagged as delaying a job (tied to the dashboard shortage alert).
- **Stores** — the goods inward register (their real columns), live running
  stock (wire in metres + coils, terminals in nos), and issue-to-job records.
- **Quality** — QA-IQP inspection plans + records; one lot on hold (tied to the
  dashboard QC alert), plus an "audit pack" export.

All four modules share the same seed data, so it feels like one connected system.

## Tech

React + Vite + Tailwind CSS. No backend, no database — all state is in-memory,
seeded from `src/data/seed.js`. "Reset demo" restores the pristine seed.
