// ---------------------------------------------------------------------------
// KPMD / MTLDK Programme seed data.
//
// This module is the single source of truth for the demonstration build. In
// production it is replaced by the governed data layer (Google Sheets via a
// service account, or the programme database). Every figure below traces to one
// of the funded outputs in investment INV 093207. Values are illustrative.
// ---------------------------------------------------------------------------

export const programme = {
  investmentId: 'INV 093207',
  name: 'Markets-Based Transformation for Livestock Development in Kenya',
  short: 'MTLDK',
  partner: 'Strathmore University Business School',
  donor: 'Bill & Melinda Gates Foundation',
  kpmdWindow: '2024 to December 2026',
  mtldkWindow: '2026 to 2029',
  counties: 10,
  offtakers: 5,
  budgetUsd: 10500000,
  spentUsd: 3140000,
  asOf: '2026-06-22'
}

// Freshness markers per source (drives the data integrity signal).
export const sources = [
  { id: 'sheets', label: 'Field aggregation sheet', updated: '2026-06-22T06:40:00', status: 'fresh' },
  { id: 'disb', label: 'Disbursement ledger', updated: '2026-06-21T18:10:00', status: 'fresh' },
  { id: 'pipeline', label: 'Co-investment tracker', updated: '2026-06-19T09:30:00', status: 'aging' },
  { id: 'meal', label: 'MEAL indicator set', updated: '2026-06-15T14:00:00', status: 'aging' }
]

// ---- The funded deliverable set (note: the schedule has no output 9) --------
export const deliverables = [
  { id: 1, cluster: 'Foundation and onboarding', title: 'Initial scaling playbook and offtaker selection', component: 'Setup completeness', cadence: 'Monthly', target: '2026-03-30', status: 'Completed', rag: 'green', progress: 100, comment: 'Eight chapters of the scaling playbook completed.' },
  { id: 2, cluster: 'Foundation and onboarding', title: 'Offtaker selection and onboarding', component: 'Setup completeness', cadence: 'Monthly', target: '2026-03-30', status: 'Completed', rag: 'green', progress: 100, comment: 'Two new offtakers onboarded. Three existing awarded new contracts.' },
  { id: 3, cluster: 'MEAL and impact framework', title: 'MEAL framework and impact assessment framework', component: 'Indicator engine', cadence: 'Quarterly', target: '2026-03-30', status: 'Completed', rag: 'green', progress: 100, comment: 'To be validated during the SEBI workshop in June.' },
  { id: 4, cluster: 'Learning and business insights', title: 'Learning agenda and business insights', component: 'Insights panel', cadence: 'Weekly', target: '2026-03-30', status: 'Completed', rag: 'green', progress: 100, comment: 'Data analyst and business insights coordinator hired.' },
  { id: 5, cluster: 'Gender transformation', title: 'Gender transformation plan and consultancy scope', component: 'Gender tracker', cadence: 'Quarterly', target: '2026-04-30', status: 'Completed', rag: 'green', progress: 100, comment: 'Consultant identified.' },
  { id: 6, cluster: 'Stakeholder engagement', title: 'Stakeholder engagement plan developed', component: 'Engagement log', cadence: 'Quarterly', target: '2026-04-30', status: 'Completed', rag: 'green', progress: 100, comment: 'Stakeholder engagement and communications manager hired. Updated as engagement progresses.' },
  { id: 7, cluster: 'Co-investment acceleration', title: 'Co-investment acceleration plan and targets developed', component: 'Pipeline board', cadence: 'Quarterly', target: '2026-04-30', status: 'Completed', rag: 'green', progress: 100, comment: 'Co-investment plan completed. Credit guarantee instrument under development. Investment Manager recruited, reports in July.' },
  { id: 8, cluster: 'Scaling and financial sustainability', title: 'Offtaker financial sustainability plan, scaling commences', component: 'Live scaling', cadence: 'Daily', target: '2026-06-30', status: 'Started', rag: 'amber', progress: 62, comment: 'All offtakers received first disbursements. Work in new counties has started.' },
  { id: 10, cluster: 'Operational dashboards', title: 'Impact, offtaker and pastoralist dashboards operational', component: 'Operational core', cadence: 'Daily', target: '2026-06-30', status: 'Completed', rag: 'green', progress: 100, comment: 'Dashboards reviewed as the programme progresses.' },
  { id: 11, cluster: 'Co-investment acceleration', title: 'Co-investment acceleration report', component: 'Pipeline board', cadence: 'Quarterly', target: '2026-12-31', status: 'Scheduled', rag: 'grey', progress: 18, comment: 'Investor identification ongoing. Report compiles investable opportunities and commitments.' },
  { id: 12, cluster: 'Annual impact reporting', title: 'First annual impact report', component: 'Impact reporting', cadence: 'Yearly', target: '2026-12-31', status: 'Scheduled', rag: 'grey', progress: 12, comment: 'Includes state of impact progress.' },
  { id: 13, cluster: 'Annual impact reporting', title: 'Second annual impact report (midline analysis)', component: 'Impact reporting', cadence: 'Yearly', target: '2027-12-31', status: 'Scheduled', rag: 'grey', progress: 0, comment: 'Includes midline analysis.' },
  { id: 14, cluster: 'Annual impact reporting', title: 'Third annual impact report', component: 'Impact reporting', cadence: 'Yearly', target: '2028-12-31', status: 'Scheduled', rag: 'grey', progress: 0, comment: 'Includes state of impact progress.' },
  { id: 15, cluster: 'Annual impact reporting', title: 'Final annual impact report (endline analysis)', component: 'Impact reporting', cadence: 'Yearly', target: '2029-12-31', status: 'Scheduled', rag: 'grey', progress: 0, comment: 'Includes endline analysis.' }
]

// ---- Offtakers (5) across 10 counties -------------------------------------
export const offtakers = [
  {
    id: 'genco', name: 'Genco', counties: ['Samburu', 'Turkana'], region: 'North Rift',
    contacts: { CEO: 'Doreen Gacheri', PM: 'Valentine Chebet' },
    meeting: { day: 'Monday', time: '07:30 to 08:15' },
    volumeTarget: 1800, volumeActual: 1646, disbursedUsd: 410000, facilityUsd: 720000,
    sustainability: 71, rag: 'amber',
    weekly: [180, 210, 240, 235, 268, 252, 281, 296],
    daily: [38, 41, 44, 39, 47, 52, 49, 46, 51, 55, 48, 53, 57, 59]
  },
  {
    id: 'chillzone', name: 'ChillZone', counties: ['Baringo', 'Nakuru'], region: 'Central Rift',
    contacts: { CEO: 'Frank Moi', CFO: 'Denis Nyanja' },
    meeting: { day: 'Monday', time: '08:15 to 09:00' },
    volumeTarget: 1500, volumeActual: 1512, disbursedUsd: 360000, facilityUsd: 600000,
    sustainability: 78, rag: 'green',
    weekly: [150, 168, 175, 182, 190, 196, 201, 208],
    daily: [34, 36, 38, 35, 40, 42, 41, 39, 43, 45, 44, 46, 48, 47]
  },
  {
    id: 'sowle', name: 'Sowle', counties: ['Isiolo'], region: 'Eastern',
    contacts: { CEO: 'Mohamed Nour', PM: 'Adenur', CFO: 'Emmanuel Otieno' },
    meeting: { day: 'Monday', time: '09:15 to 10:00' },
    volumeTarget: 900, volumeActual: 742, disbursedUsd: 240000, facilityUsd: 420000,
    sustainability: 58, rag: 'red',
    weekly: [110, 98, 104, 92, 95, 88, 96, 101],
    daily: [22, 19, 24, 18, 21, 23, 20, 25, 22, 19, 24, 26, 23, 25]
  },
  {
    id: 'livemo', name: 'LiveMo', counties: ['Kajiado', 'Laikipia', 'Kilifi'], region: 'Multi-region',
    contacts: { CEO: 'Muthoni Kioria', PM: 'Lisa', Logistics: 'Paul' },
    meeting: { day: 'Tuesday', time: '07:30 to 08:15' },
    volumeTarget: 2400, volumeActual: 2388, disbursedUsd: 520000, facilityUsd: 900000,
    sustainability: 74, rag: 'green',
    weekly: [240, 268, 282, 295, 301, 312, 318, 324],
    daily: [52, 55, 58, 54, 61, 63, 60, 59, 64, 66, 62, 67, 69, 71]
  },
  {
    id: 'abf', name: 'ABF', counties: ['Narok', 'Tana River'], region: 'South Rift / Coast',
    contacts: { CEO: 'Abdulosman Bukolo', PM: 'Alexander Okello', Logistics: 'Zahra Bukolo' },
    meeting: { day: 'Tuesday', time: '09:00 to 09:45' },
    volumeTarget: 2000, volumeActual: 1864, disbursedUsd: 480000, facilityUsd: 820000,
    sustainability: 66, rag: 'amber',
    weekly: [200, 218, 226, 231, 238, 244, 249, 258],
    daily: [44, 46, 49, 45, 51, 53, 50, 48, 54, 56, 52, 57, 59, 61]
  }
]

// ---- Co-investment pipeline (outputs 7, 11) -------------------------------
export const pipeline = {
  facility: { name: 'Credit Guarantee Instrument', sizeUsd: 10000000, deployedUsd: 2010000, status: 'Under development' },
  targetLeverageUsd: 14000000,
  securedUsd: 4250000,
  investors: [
    { name: 'Regional impact fund', stage: 'Committed', amountUsd: 2000000, focus: 'Working capital' },
    { name: 'Development finance institution', stage: 'Due diligence', amountUsd: 3500000, focus: 'Cold chain' },
    { name: 'Commercial bank syndicate', stage: 'Engaged', amountUsd: 4000000, focus: 'Offtaker lending' },
    { name: 'Pan-African agribusiness investor', stage: 'Engaged', amountUsd: 2500000, focus: 'Equity' },
    { name: 'Local SACCO partnership', stage: 'Identified', amountUsd: 1200000, focus: 'Pastoralist credit' },
    { name: 'Diaspora bond vehicle', stage: 'Identified', amountUsd: 1800000, focus: 'Blended finance' }
  ]
}

// ---- MEAL indicators (output 3 underpins these) ---------------------------
export const meal = [
  { name: 'Pastoralist households reached', baseline: 0, current: 18400, target: 42000, unit: 'households', deliverable: 8 },
  { name: 'Livestock aggregated', baseline: 0, current: 8152, target: 24000, unit: 'head / week', deliverable: 10 },
  { name: 'Average offtake price uplift', baseline: 0, current: 11, target: 18, unit: '% vs baseline', deliverable: 8 },
  { name: 'Women in active aggregation roles', baseline: 0, current: 31, target: 45, unit: '% of participants', deliverable: 5 },
  { name: 'Offtaker financial sustainability', baseline: 40, current: 69, target: 80, unit: 'index', deliverable: 8 },
  { name: 'Co-investment leverage secured', baseline: 0, current: 4.25, target: 14, unit: 'USD m', deliverable: 7 }
]

// ---- Gender milestones (output 5) -----------------------------------------
export const gender = [
  { milestone: 'Gender transformation plan finalised', quarter: 'Q1 2026', status: 'green' },
  { milestone: 'Consultancy scope and consultant engaged', quarter: 'Q2 2026', status: 'green' },
  { milestone: 'Baseline gender disaggregation captured', quarter: 'Q2 2026', status: 'amber' },
  { milestone: 'Women aggregator cohort onboarded', quarter: 'Q3 2026', status: 'grey' }
]

// ---- Stakeholder engagement (output 6) ------------------------------------
export const stakeholders = [
  { group: 'County governments', engagements: 14, sentiment: 'green', note: 'MoUs progressing in 8 of 10 counties.' },
  { group: 'Pastoralist cooperatives', engagements: 22, sentiment: 'green', note: 'Active aggregation partnerships.' },
  { group: 'Financial institutions', engagements: 9, sentiment: 'amber', note: 'Pending credit guarantee terms.' },
  { group: 'Export buyers (GCC)', engagements: 5, sentiment: 'amber', note: 'Specification alignment underway.' }
]

// ---- Yearly impact reporting (outputs 12 to 15) ---------------------------
export const impact = {
  valueForMoneyUsd: 0.71, // programme cost per USD of market value mobilised (illustrative)
  rows: [
    { year: 2026, report: 'First annual impact report', analysis: 'Baseline plus early progress', due: '2026-12-31', readiness: 12 },
    { year: 2027, report: 'Second annual impact report', analysis: 'Midline analysis', due: '2027-12-31', readiness: 0 },
    { year: 2028, report: 'Third annual impact report', analysis: 'State of impact progress', due: '2028-12-31', readiness: 0 },
    { year: 2029, report: 'Final annual impact report', analysis: 'Endline analysis', due: '2029-12-31', readiness: 0 }
  ]
}

// ---- Issue log and actions (weekly tier) ----------------------------------
export const issues = [
  { offtaker: 'Sowle', issue: 'Aggregation volumes below target three weeks running', owner: 'Adenur', severity: 'red', due: '2026-06-27' },
  { offtaker: 'ABF', issue: 'Tana River cold chain access intermittent', owner: 'Alexander Okello', severity: 'amber', due: '2026-06-30' },
  { offtaker: 'Genco', issue: 'Turkana onboarding paperwork pending', owner: 'Valentine Chebet', severity: 'amber', due: '2026-06-25' }
]

// helpers ---------------------------------------------------------------------
export const ragLabel = { green: 'On track', amber: 'At risk', red: 'Off track', grey: 'Scheduled' }
