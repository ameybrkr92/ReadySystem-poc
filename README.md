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

## Logins (demo)

Enterprise-style sign-in with username + password. Demo credentials are not
shown on the front page — expand **"Demo access"** at the bottom of the card to
pick a role (demo password **`ready`**). Each role sees only what it owns (plus
the shared dashboard); the Director sees everything.

| Username    | Role                | Sees                                    | Can create            |
|-------------|---------------------|-----------------------------------------|-----------------------|
| `director`  | Director            | Dashboard (rich KPIs) + all modules     | everything            |
| `planning`  | Planning            | Dashboard + Planning                    | work orders           |
| `purchase`  | Purchase & Costing  | Dashboard + Purchase + Planning (cost)  | purchase orders       |
| `inventory` | Inventory           | Dashboard + Inventory                   | GRNs, issue, incoming QC |
| `quality`   | Quality             | Dashboard + Quality + Inventory         | final inspections, incoming QC |

## What you'll see

- **Dashboard (the hero)** — live KPI strip, an order status board with a
  `RFQ → Final BOM → Costing → Quote → PO → Purchase → Stores → Build → QC → Dispatch`
  tracker per order (completed = teal, current = highlighted, stuck = pulsing red),
  and a right rail with alerts + a streaming activity feed.
  - The simulation advances every few seconds on its own. Use **Play/Pause**,
    the **speed** selector (0.5×–4×), **Fast-forward day**, and **Reset demo**.
- **Dashboard** — KPI strip, **project-wise** rollup, and the live order board.
  The Director also gets extra KPIs (Stuck) and a stage-distribution matrix.
- **Planning & BOM** — orders + the **total BOM**: the planner reads the
  drawings and builds the full BOM, clearly split into *client-supplied
  (Siemens)* apparatus and the *harness, lugs, ferrules, ducting and
  consumables Ready Systems adds* (not in the client BOM). Plus config parse,
  costing, and the two date milestones.
- **Purchase** — POs raised from BOMs with real suppliers; one pending PO is
  flagged as delaying a job (tied to the dashboard shortage alert).
- **Inventory** (formerly Stores) — goods inward register (real columns), live
  stock (metres + coils, nos), issue-to-job, and **incoming QC done right here**
  at the inward desk (clear or hold each lot).
- **Quality** — **final** pre-dispatch inspection records and the "audit pack"
  export, with a read-only **incoming history** tab. A final panel is on hold
  (tied to the dashboard QC alert).

## Making entries

Roles with edit rights get **New …** buttons that open forms writing to the
shared in-memory state — so the whole system reacts at once:

- **Planning → New work order** — joins the live pipeline at RFQ.
- **Purchase → New PO** — multi-line PO against a supplier and work order.
- **Inventory → New GRN / Issue to job** — a GRN bumps live stock and queues
  incoming QC; **Accept / Hold** clears the lot in incoming QC; an issue draws
  stock down against a W/O.
- **Quality → New inspection** — record a final inspection; a "hold" raises an
  alert on the dashboard.

"Reset demo" restores the pristine seed (it does not log you out).

All modules share the same seed data, so it feels like one connected system.

## Tech

React + Vite + Tailwind CSS. No backend, no database — all state is in-memory,
seeded from `src/data/seed.js`. "Reset demo" restores the pristine seed.
