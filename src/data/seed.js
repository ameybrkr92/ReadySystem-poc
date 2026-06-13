// ---------------------------------------------------------------------------
// Ready Systems ERP — seed data
// Realistic-but-simulated data modelled on the shop's real Siemens tracker,
// inward register, supplier list and QA documents. This is a DEMO: numbers are
// plausible, not accounting-accurate.
// ---------------------------------------------------------------------------

// The full production pipeline every order moves through.
export const STAGES = [
  'RFQ',
  'Final BOM',
  'Costing',
  'Quote',
  'PO',
  'Purchase',
  'Stores',
  'Build',
  'QC',
  'Dispatch',
]

export const stageIndex = (name) => STAGES.indexOf(name)

// Feeder legend used by the Planning module to "parse" a config string.
export const FEEDER_LEGEND = {
  R: { code: 'R', name: 'Ring-main', desc: 'Ring-main unit (incoming/outgoing)' },
  L: { code: 'L', name: 'Circuit-breaker', desc: 'Vacuum circuit-breaker feeder' },
  T: { code: 'T', name: 'Transformer', desc: 'Transformer feeder' },
  K: { code: 'K', name: 'Cable', desc: 'Cable connection feeder' },
  S: { code: 'S', name: 'Sectionalizer', desc: 'Sectionalizer / bus-section' },
}

export const SUPPLIERS = [
  'NPS Engineers',
  'Aviza Technologies',
  'RR Kabel Limited',
  'Terminal Technologies',
]

// Material master — rates pulled from the real inward register (₹).
export const MATERIALS = [
  { id: 'm1', desc: 'PVC Insu HV 1.5sqmm Grey', unit: 'm', rate: 18.03 },
  { id: 'm2', desc: 'PVC Insu HV 2.5sqmm Grey', unit: 'm', rate: 29.62 },
  { id: 'm3', desc: 'PVC Insu HV 2.5sqmm Red', unit: 'm', rate: 29.62 },
  { id: 'm4', desc: 'PVC Insu HV 2.5sqmm Black', unit: 'm', rate: 29.62 },
  { id: 'm5', desc: 'PVC Insu HV 2.5sqmm Blue', unit: 'm', rate: 29.62 },
  { id: 'm6', desc: 'PVC Sleeve 16mm Black', unit: 'm', rate: 14.63 },
  { id: 'm7', desc: 'Snap-on Terminal', unit: 'nos', rate: 1.68 },
]

// One coil of wire ≈ 100 m (used to show "metres + coils" on the stock view).
export const COIL_METRES = 100

// ---------------------------------------------------------------------------
// Access control (demo). Each role sees the dashboard plus the modules it owns;
// the Director sees everything. `edit` lists the modules a role can add records
// to. This is in-memory demo auth — no real backend or passwords.
// ---------------------------------------------------------------------------
export const ROLES = {
  director: {
    id: 'director',
    label: 'Director',
    blurb: 'Full visibility — every module, every order',
    modules: ['dashboard', 'planning', 'purchase', 'stores', 'quality'],
    edit: ['planning', 'purchase', 'stores', 'quality'],
  },
  planning: {
    id: 'planning',
    label: 'Planning',
    blurb: 'Work orders, BOM & costing',
    modules: ['dashboard', 'planning'],
    edit: ['planning'],
  },
  purchase: {
    id: 'purchase',
    label: 'Purchase & Costing',
    blurb: 'Purchase orders, suppliers & costing',
    modules: ['dashboard', 'purchase', 'planning'],
    edit: ['purchase'],
  },
  stores: {
    id: 'stores',
    label: 'Stores',
    blurb: 'Goods inward, stock & issue-to-job',
    modules: ['dashboard', 'stores'],
    edit: ['stores'],
  },
  quality: {
    id: 'quality',
    label: 'Quality',
    blurb: 'Incoming & final inspection',
    modules: ['dashboard', 'quality'],
    edit: ['quality'],
  },
}

// Demo user accounts. The same password unlocks all of them in the demo.
export const DEMO_PASSWORD = 'ready'
export const USERS = [
  { username: 'director', name: 'R. Ready', role: 'director', initials: 'RR' },
  { username: 'planning', name: 'S. Kulkarni', role: 'planning', initials: 'SK' },
  { username: 'purchase', name: 'M. Joshi', role: 'purchase', initials: 'MJ' },
  { username: 'stores', name: 'R. Shinde', role: 'stores', initials: 'RS' },
  { username: 'quality', name: 'A. Patil', role: 'quality', initials: 'AP' },
]

// Can a role create records in a given module?
export function canEdit(roleId, moduleId) {
  const r = ROLES[roleId]
  return !!r && r.edit.includes(moduleId)
}

function buildSeed() {
  // -- Orders -------------------------------------------------------------
  // Spread across the pipeline; 2 deliberately stuck (red), 1 done.
  const orders = [
    {
      id: '3009611593/100',
      client: 'Siemens Energy India Ltd',
      product: '8DJHST',
      config: 'RRL',
      motorised: false,
      qty: 2,
      stage: 'Build',
      status: 'ontrack',
      progress: 40,
      stuckReason: null,
      bomToCosting: '14/04/2026',
      costingToSiemens: '18/04/2026',
    },
    {
      id: '3009628618/100',
      client: 'Aravinda Infra (AIPL)',
      product: '8DJHST',
      config: 'ME+LRRL-',
      motorised: true,
      qty: 1,
      stage: 'Purchase',
      status: 'stuck',
      progress: 55,
      stuckReason: '2.5sqmm Grey short by 400m — PO not received',
      bomToCosting: '02/05/2026',
      costingToSiemens: '06/05/2026',
    },
    {
      id: '3009649896/100',
      client: 'Radiance LOT 3',
      product: '8DJHST',
      config: 'RRL+ME',
      motorised: false,
      qty: 3,
      stage: 'Costing',
      status: 'ontrack',
      progress: 30,
      stuckReason: null,
      bomToCosting: '10/05/2026',
      costingToSiemens: '—',
    },
    {
      id: '3009348471/100',
      client: 'Switchgear Controls',
      product: '8DJHST',
      config: 'LRRL+ME',
      motorised: true,
      qty: 1,
      stage: 'QC',
      status: 'stuck',
      progress: 70,
      stuckReason: 'Final QC hold — HV withstand flashover at feeder 3, panel sent for rework',
      bomToCosting: '20/03/2026',
      costingToSiemens: '24/03/2026',
    },
    {
      id: '3008917364/400',
      client: 'Rajesh Robust UGVCL',
      product: '8DJHST',
      config: 'RRRL',
      motorised: false,
      qty: 4,
      stage: 'Dispatch',
      status: 'done',
      progress: 100,
      stuckReason: null,
      bomToCosting: '28/02/2026',
      costingToSiemens: '04/03/2026',
    },
    {
      id: 'CSS-ADANI-001',
      client: 'Adani Dhamra Port',
      product: '8FB20',
      config: 'RRL+ME',
      motorised: true,
      qty: 2,
      stage: 'Final BOM',
      status: 'ontrack',
      progress: 50,
      stuckReason: null,
      bomToCosting: '—',
      costingToSiemens: '—',
    },
    {
      id: '3009646299/100',
      client: 'NSMG',
      product: '8FB20',
      config: 'RRL',
      motorised: false,
      qty: 1,
      stage: 'Quote',
      status: 'ontrack',
      progress: 60,
      stuckReason: null,
      bomToCosting: '08/05/2026',
      costingToSiemens: '12/05/2026',
    },
  ]

  // -- Purchase orders ----------------------------------------------------
  const purchaseOrders = [
    {
      id: 'PO-2026-0418',
      supplier: 'RR Kabel Limited',
      wo: '3009611593/100',
      raisedOn: '11/04/2026',
      status: 'Received',
      note: null,
      items: [
        { desc: 'PVC Insu HV 2.5sqmm Grey', qty: 600, unit: 'm', rate: 29.62 },
        { desc: 'PVC Insu HV 2.5sqmm Red', qty: 300, unit: 'm', rate: 29.62 },
      ],
    },
    {
      id: 'PO-2026-0431',
      supplier: 'RR Kabel Limited',
      wo: '3009628618/100',
      raisedOn: '28/04/2026',
      status: 'Pending',
      note: 'Pending — delaying Job 3009628618/100 (2.5sqmm Grey short by 400m)',
      items: [
        { desc: 'PVC Insu HV 2.5sqmm Grey', qty: 800, unit: 'm', rate: 29.62 },
        { desc: 'PVC Insu HV 1.5sqmm Grey', qty: 400, unit: 'm', rate: 18.03 },
      ],
    },
    {
      id: 'PO-2026-0436',
      supplier: 'Terminal Technologies',
      wo: '3009649896/100',
      raisedOn: '03/05/2026',
      status: 'Partially Received',
      note: 'Snap-on terminals part-received (1,200 of 2,000 nos)',
      items: [
        { desc: 'Snap-on Terminal', qty: 2000, unit: 'nos', rate: 1.68 },
        { desc: 'PVC Sleeve 16mm Black', qty: 250, unit: 'm', rate: 14.63 },
      ],
    },
    {
      id: 'PO-2026-0440',
      supplier: 'NPS Engineers',
      wo: '3009348471/100',
      raisedOn: '15/03/2026',
      status: 'Received',
      note: null,
      items: [
        { desc: 'PVC Sleeve 16mm Black', qty: 180, unit: 'm', rate: 14.63 },
        { desc: 'PVC Insu HV 2.5sqmm Black', qty: 500, unit: 'm', rate: 29.62 },
      ],
    },
    {
      id: 'PO-2026-0409',
      supplier: 'Aviza Technologies',
      wo: '3008917364/400',
      raisedOn: '26/02/2026',
      status: 'Received',
      note: null,
      items: [
        { desc: 'PVC Insu HV 2.5sqmm Blue', qty: 700, unit: 'm', rate: 29.62 },
        { desc: 'PVC Insu HV 2.5sqmm Grey', qty: 900, unit: 'm', rate: 29.62 },
      ],
    },
  ]

  // -- Stores: goods inward register (their real columns) -----------------
  const goodsInward = [
    {
      date: '11/04/2026',
      grn: 'GRN/112',
      po: 'PO-2026-0418',
      lot: 'L/4/26-08',
      lr: 'LR-44821',
      party: 'RR Kabel Limited',
      item: 'PVC Insu HV 2.5sqmm Grey',
      challan: 'INV-RRK-9920',
      qty: '600 m',
      rate: 29.62,
      inspection: 'Accepted',
      remark: 'Lot OK',
      sign: 'RS',
    },
    {
      date: '11/04/2026',
      grn: 'GRN/113',
      po: 'PO-2026-0418',
      lot: 'L/4/26-09',
      lr: 'LR-44821',
      party: 'RR Kabel Limited',
      item: 'PVC Insu HV 2.5sqmm Red',
      challan: 'INV-RRK-9920',
      qty: '300 m',
      rate: 29.62,
      inspection: 'Accepted',
      remark: '',
      sign: 'RS',
    },
    {
      date: '04/05/2026',
      grn: 'GRN/121',
      po: 'PO-2026-0436',
      lot: 'L/5/26-03',
      lr: 'LR-45110',
      party: 'Terminal Technologies',
      item: 'Snap-on Terminal',
      challan: 'INV-TT-3381',
      qty: '1200 nos',
      rate: 1.68,
      inspection: 'Accepted',
      remark: 'Part qty — balance 800 awaited',
      sign: 'AP',
    },
    {
      date: '15/03/2026',
      grn: 'GRN/098',
      po: 'PO-2026-0440',
      lot: 'S/3/26-02',
      lr: 'LR-43770',
      party: 'NPS Engineers',
      item: 'PVC Sleeve 16mm Black',
      challan: 'INV-NPS-1187',
      qty: '180 m',
      rate: 14.63,
      inspection: 'On Hold',
      remark: 'Sent for re-inspection (Job 3009348471)',
      sign: 'AP',
    },
    {
      date: '26/02/2026',
      grn: 'GRN/081',
      po: 'PO-2026-0409',
      lot: 'L/2/26-11',
      lr: 'LR-43002',
      party: 'Aviza Technologies',
      item: 'PVC Insu HV 2.5sqmm Blue',
      challan: 'INV-AVZ-7765',
      qty: '700 m',
      rate: 29.62,
      inspection: 'Accepted',
      remark: '',
      sign: 'RS',
    },
  ]

  // -- Stores: running stock (wire in metres + coils, terminals in nos) ----
  const stock = [
    { item: 'PVC Insu HV 1.5sqmm Grey', unit: 'm', onHand: 120, reorder: 200, low: true },
    { item: 'PVC Insu HV 2.5sqmm Grey', unit: 'm', onHand: 95, reorder: 200, low: true },
    { item: 'PVC Insu HV 2.5sqmm Red', unit: 'm', onHand: 410, reorder: 200, low: false },
    { item: 'PVC Insu HV 2.5sqmm Black', unit: 'm', onHand: 360, reorder: 200, low: false },
    { item: 'PVC Insu HV 2.5sqmm Blue', unit: 'm', onHand: 520, reorder: 200, low: false },
    { item: 'PVC Sleeve 16mm Black', unit: 'm', onHand: 240, reorder: 150, low: false },
    { item: 'Snap-on Terminal', unit: 'nos', onHand: 1850, reorder: 800, low: false },
  ]

  // -- Stores: issue-to-job (the thing paper can't do) --------------------
  const issues = [
    { date: '15/04/2026', wo: '3009611593/100', item: 'PVC Insu HV 2.5sqmm Grey', qty: '320 m', by: 'RS' },
    { date: '15/04/2026', wo: '3009611593/100', item: 'PVC Insu HV 2.5sqmm Red', qty: '180 m', by: 'RS' },
    { date: '06/05/2026', wo: '3009649896/100', item: 'Snap-on Terminal', qty: '640 nos', by: 'AP' },
    { date: '18/03/2026', wo: '3009348471/100', item: 'PVC Insu HV 2.5sqmm Black', qty: '300 m', by: 'AP' },
    { date: '27/02/2026', wo: '3008917364/400', item: 'PVC Insu HV 2.5sqmm Blue', qty: '560 m', by: 'RS' },
  ]

  // -- Quality: inspection records ----------------------------------------
  const qualityRecords = [
    {
      id: 'IQP-0445',
      qcType: 'incoming',
      doc: 'QA-IQP-011 Rev 9',
      material: 'PVC Black Sleeve 16mm',
      grn: 'GRN/098',
      lot: 'S/3/26-02',
      checkedBy: 'A. Patil',
      date: '16/03/2026',
      status: 'hold',
      wo: '3009348471/100',
      disposition: 'Rework',
      parameters: [
        { param: 'Bore diameter', spec: '16.0 ± 0.3 mm', method: 'Vernier', frequency: 'Per lot', observation: '16.6 mm', pass: false },
        { param: 'Wall thickness', spec: '≥ 0.6 mm', method: 'Micrometer', frequency: 'Per lot', observation: '0.62 mm', pass: true },
        { param: 'Colour', spec: 'Matte black', method: 'Visual', frequency: '100%', observation: 'OK', pass: true },
        { param: 'Dielectric', spec: '≥ 600 V', method: 'HV tester', frequency: 'Sample', observation: '640 V', pass: true },
      ],
    },
    {
      id: 'IQP-0440',
      qcType: 'incoming',
      doc: 'QA-IQP-004 Rev 6',
      material: 'PVC Insu HV 2.5sqmm Grey',
      grn: 'GRN/112',
      lot: 'L/4/26-08',
      checkedBy: 'R. Shinde',
      date: '11/04/2026',
      status: 'pass',
      wo: '3009611593/100',
      disposition: 'Accept → Stores',
      parameters: [
        { param: 'Conductor size', spec: '2.5 sqmm', method: 'Gauge', frequency: 'Per lot', observation: '2.5 sqmm', pass: true },
        { param: 'Insulation OD', spec: '3.4 ± 0.2 mm', method: 'Vernier', frequency: 'Per lot', observation: '3.45 mm', pass: true },
        { param: 'Colour', spec: 'Grey', method: 'Visual', frequency: '100%', observation: 'OK', pass: true },
        { param: 'Continuity', spec: 'Pass', method: 'Multimeter', frequency: 'Sample', observation: 'Pass', pass: true },
      ],
    },
    {
      id: 'IQP-0438',
      qcType: 'incoming',
      doc: 'QA-IQP-004 Rev 6',
      material: 'PVC Insu HV 2.5sqmm Red',
      grn: 'GRN/113',
      lot: 'L/4/26-09',
      checkedBy: 'R. Shinde',
      date: '11/04/2026',
      status: 'pass',
      wo: '3009611593/100',
      disposition: 'Accept → Stores',
      parameters: [
        { param: 'Conductor size', spec: '2.5 sqmm', method: 'Gauge', frequency: 'Per lot', observation: '2.5 sqmm', pass: true },
        { param: 'Insulation OD', spec: '3.4 ± 0.2 mm', method: 'Vernier', frequency: 'Per lot', observation: '3.42 mm', pass: true },
        { param: 'Colour', spec: 'Red', method: 'Visual', frequency: '100%', observation: 'OK', pass: true },
      ],
    },
    {
      id: 'IQP-0431',
      qcType: 'incoming',
      doc: 'QA-IQP-019 Rev 3',
      material: 'Snap-on Terminal',
      grn: 'GRN/121',
      lot: 'L/5/26-03',
      checkedBy: 'A. Patil',
      date: '04/05/2026',
      status: 'pass',
      wo: '3009649896/100',
      disposition: 'Accept → Stores',
      parameters: [
        { param: 'Crimp width', spec: '6.2 ± 0.2 mm', method: 'Vernier', frequency: 'Sample', observation: '6.25 mm', pass: true },
        { param: 'Plating', spec: 'Tin, uniform', method: 'Visual', frequency: '100%', observation: 'OK', pass: true },
        { param: 'Pull-out force', spec: '≥ 80 N', method: 'Force gauge', frequency: 'Sample', observation: '92 N', pass: true },
      ],
    },
    // ---- Final / pre-dispatch inspection (after assembly) ----
    {
      id: 'FQC-0210',
      qcType: 'final',
      doc: 'QA-FQP-002 Rev 4',
      material: 'Assembled panel — 8DJHST LRRL+ME',
      grn: '—',
      lot: 'WO 3009348471/100',
      checkedBy: 'A. Patil',
      date: '11/06/2026',
      status: 'hold',
      wo: '3009348471/100',
      disposition: 'Rework',
      parameters: [
        { param: 'HV withstand (1 min)', spec: '28 kV, no flashover', method: 'HV set', frequency: '100%', observation: 'Flashover at feeder 3', pass: false },
        { param: 'Wiring continuity', spec: 'As per scheme', method: 'Buzzer', frequency: '100%', observation: 'OK', pass: true },
        { param: 'Torque marking', spec: 'All joints marked', method: 'Visual', frequency: '100%', observation: 'OK', pass: true },
        { param: 'Mechanical operation', spec: '5 cycles OK', method: 'Manual', frequency: '100%', observation: 'OK', pass: true },
      ],
    },
    {
      id: 'FQC-0208',
      qcType: 'final',
      doc: 'QA-FQP-002 Rev 4',
      material: 'Assembled panel — 8DJHST RRRL',
      grn: '—',
      lot: 'WO 3008917364/400',
      checkedBy: 'R. Shinde',
      date: '03/03/2026',
      status: 'pass',
      wo: '3008917364/400',
      disposition: 'Accept → Dispatch',
      parameters: [
        { param: 'HV withstand (1 min)', spec: '28 kV, no flashover', method: 'HV set', frequency: '100%', observation: 'No flashover', pass: true },
        { param: 'Wiring continuity', spec: 'As per scheme', method: 'Buzzer', frequency: '100%', observation: 'OK', pass: true },
        { param: 'Primary injection', spec: 'Trips within band', method: 'Injection set', frequency: '100%', observation: 'OK', pass: true },
        { param: 'Paint & labels', spec: 'No damage, correct', method: 'Visual', frequency: '100%', observation: 'OK', pass: true },
      ],
    },
  ]

  // -- Activity feed (seeded recent events) -------------------------------
  const activity = [
    { id: 'a1', kind: 'grn', text: 'GRN/112 received — RR Kabel Limited (2.5sqmm Grey, 600m)', time: '09:12' },
    { id: 'a2', kind: 'qc', text: 'QC passed: PVC Sleeve lot S/6/26', time: '09:31' },
    { id: 'a3', kind: 'issue', text: 'Issued 320m 2.5sqmm Grey to Job 3009611593/100', time: '10:04' },
    { id: 'a4', kind: 'stage', text: 'Job 3009646299/100 moved RFQ → Quote', time: '10:22' },
    { id: 'a5', kind: 'alert', text: 'Job 3009628618/100 stuck: 2.5sqmm Grey short by 400m', time: '10:40' },
  ]

  // -- Alerts (seeded; sim adds more) -------------------------------------
  const alerts = [
    {
      id: 'al1',
      severity: 'red',
      title: 'Material shortage',
      text: 'Job 3009628618/100 — 2.5sqmm Grey short by 400m. PO-2026-0431 pending at RR Kabel.',
      wo: '3009628618/100',
    },
    {
      id: 'al2',
      severity: 'red',
      title: 'QC hold',
      text: 'Job 3009348471/100 — final inspection hold (HV flashover at feeder 3). Panel on rework.',
      wo: '3009348471/100',
    },
    {
      id: 'al3',
      severity: 'amber',
      title: 'Low stock',
      text: '2.5sqmm Grey at 95m and 1.5sqmm Grey at 120m — below reorder level.',
      wo: null,
    },
  ]

  return {
    orders,
    purchaseOrders,
    goodsInward,
    stock,
    issues,
    qualityRecords,
    activity,
    alerts,
  }
}

// Always hand out a fresh deep copy so "Reset demo" restores pristine state.
export function makeSeed() {
  return JSON.parse(JSON.stringify(buildSeed()))
}
