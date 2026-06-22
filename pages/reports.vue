<template>
  <div class="page">
    <div class="page-head">
      <div class="eyebrow">The reporting engine</div>
      <h1>Reports</h1>
      <p>Three selectors assemble one report from the governed data layer, then export it to Word, PowerPoint, PDF or Excel. Because every format renders the same model, an exported report can never disagree with the live screen.</p>
    </div>

    <div class="card builder">
      <div class="card-head"><h3>Report builder</h3><span class="sub">Period × scope × audience</span></div>
      <div class="builder-body">
        <div class="selectors">
          <div>
            <label class="field-label">Period</label>
            <select class="select" v-model="periodId">
              <option v-for="p in PERIODS" :key="p.id" :value="p.id">{{ p.label }}</option>
            </select>
          </div>
          <div>
            <label class="field-label">Deliverable scope</label>
            <select class="select" v-model="scopeId">
              <option v-for="s in SCOPES" :key="s.id" :value="s.id">{{ s.label }}</option>
            </select>
          </div>
          <div>
            <label class="field-label">Audience template</label>
            <select class="select" v-model="audienceId">
              <option v-for="a in AUDIENCES" :key="a.id" :value="a.id">{{ a.label }}</option>
            </select>
          </div>
        </div>

        <div class="preview">
          <div class="prev-head">
            <div>
              <div class="prev-title">{{ model.meta.title }}</div>
              <div class="prev-meta">{{ model.meta.periodLabel }} · {{ model.meta.deliverableLabel }}</div>
            </div>
            <span class="audience-badge" :class="audienceId">{{ audienceId === 'donor' ? 'Accountability' : 'Operational' }}</span>
          </div>
          <div class="prev-summary">
            <div v-for="(s, i) in model.summary" :key="i" class="ps">
              <div class="ps-v">{{ s.value }}</div>
              <div class="ps-l">{{ s.label }}</div>
            </div>
          </div>
          <p class="prev-narrative">{{ model.narrative }}</p>
          <div class="prev-tables">
            <span v-for="(t, i) in model.tables" :key="i" class="ttag">{{ t.title }}</span>
          </div>
          <div class="prev-foot muted">Generated {{ model.meta.generatedAt }} · {{ model.meta.freshness }}</div>
        </div>

        <div class="exports">
          <span class="exp-label">Export as</span>
          <button class="btn primary" :disabled="busy" @click="go('docx')">
            <span v-html="ICON.word"></span> Word
          </button>
          <button class="btn gold" :disabled="busy" @click="go('pptx')">
            <span v-html="ICON.ppt"></span> PowerPoint
          </button>
          <button class="btn" :disabled="busy" @click="go('pdf')">
            <span v-html="ICON.pdf"></span> PDF
          </button>
          <button class="btn" :disabled="busy" @click="go('xlsx')">
            <span v-html="ICON.xls"></span> Excel
          </button>
          <span v-if="busy" class="busy">Generating {{ lastFormat }}…</span>
        </div>
      </div>
    </div>

    <div class="section-title">Standing report catalogue</div>
    <div class="card">
      <table class="data">
        <thead>
          <tr><th>Report</th><th>Cadence</th><th>Audience</th><th>Outputs</th><th style="width:300px">Export</th></tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in catalogue" :key="i">
            <td class="strong">{{ r.name }}</td>
            <td class="muted">{{ r.cadence }}</td>
            <td><span class="audience-badge" :class="r.audience">{{ r.audience === 'donor' ? 'Donor' : r.audience === 'staff' ? 'Staff' : 'Both' }}</span></td>
            <td><span class="tag-outputs">{{ r.outputs }}</span></td>
            <td>
              <div class="cat-btns">
                <button v-for="f in r.formats" :key="f" class="btn sm" :disabled="busy" @click="runCatalogue(r, f)">{{ fmtName[f] }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="note" style="margin-top:18px">
      <b>Format follows purpose.</b> Every export carries the period it covers, the date and time it was generated and a data-freshness marker. Export rights follow the same role rules as the live views, and the export trail remains auditable.
    </div>
  </div>
</template>

<script setup>
const { busy, lastFormat, run, buildReportModel, PERIODS, SCOPES, AUDIENCES } = useReportExport()

const periodId = ref('quarter')
const scopeId = ref('all')
const audienceId = ref('donor')

const model = computed(() => buildReportModel({ periodId: periodId.value, scopeId: scopeId.value, audienceId: audienceId.value }))
const go = (format) => run(format, model.value)

const fmtName = { docx: 'Word', pptx: 'PPT', pdf: 'PDF', xlsx: 'Excel' }

// Standing catalogue mirrors section 6.2 of the best-practice note.
const catalogue = [
  { name: 'Daily operations snapshot', cadence: 'Daily', audience: 'staff', outputs: '8, 10', periodId: 'day', scopeId: 'operational', audienceId: 'staff', formats: ['docx', 'pptx', 'pdf'] },
  { name: 'Weekly offtaker scorecard', cadence: 'Weekly', audience: 'staff', outputs: '4, 8, 10', periodId: 'week', scopeId: 'operational', audienceId: 'staff', formats: ['docx', 'pptx', 'pdf', 'xlsx'] },
  { name: 'Monthly programme report', cadence: 'Monthly', audience: 'both', outputs: '1 to 11', periodId: 'month', scopeId: 'all', audienceId: 'staff', formats: ['docx', 'pptx', 'pdf'] },
  { name: 'Quarterly donor brief', cadence: 'Quarterly', audience: 'donor', outputs: '3, 5, 6, 7, 8, 11', periodId: 'quarter', scopeId: 'accountability', audienceId: 'donor', formats: ['docx', 'pptx', 'pdf'] },
  { name: 'Co-investment pipeline report', cadence: 'Monthly and quarterly', audience: 'donor', outputs: '7, 11', periodId: 'quarter', scopeId: 'coinvest', audienceId: 'donor', formats: ['docx', 'pptx', 'pdf', 'xlsx'] },
  { name: 'Annual impact report', cadence: 'Yearly', audience: 'donor', outputs: '12 to 15', periodId: 'year', scopeId: 'impact', audienceId: 'donor', formats: ['docx', 'pptx', 'pdf'] },
  { name: 'Deliverable status export', cadence: 'On demand', audience: 'both', outputs: 'Any selected', periodId: 'programme', scopeId: 'all', audienceId: 'staff', formats: ['docx', 'pptx', 'xlsx'] }
]

const runCatalogue = (r, format) => {
  const m = buildReportModel({ periodId: r.periodId, scopeId: r.scopeId, audienceId: r.audienceId })
  run(format, m)
}

const ICON = {
  word: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 13l1.5 4 1.5-4 1.5 4 1.5-4"/></svg>',
  ppt: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M9 17v-5h2.5a1.5 1.5 0 0 1 0 3H9"/></svg>',
  pdf: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>',
  xls: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M9 12l5 6M14 12l-5 6"/></svg>'
}
</script>

<style scoped>
.builder-body { padding: 20px; }
.selectors { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
.preview { background: #fafbfd; border: 1px solid var(--border); border-radius: 12px; padding: 18px 20px; }
.prev-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.prev-title { font-size: 16px; font-weight: 800; color: var(--navy-dk); text-transform: capitalize; }
.prev-meta { font-size: 12px; color: var(--ink-3); margin-top: 2px; }
.prev-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 14px; }
.ps { background: #fff; border: 1px solid var(--border); border-radius: 9px; padding: 10px 12px; }
.ps-v { font-size: 18px; font-weight: 800; color: var(--navy); }
.ps-l { font-size: 11px; color: var(--ink-3); margin-top: 2px; }
.prev-narrative { font-size: 13px; color: var(--ink-2); line-height: 1.55; margin: 0 0 12px; }
.prev-tables { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 12px; }
.ttag { font-size: 11.5px; font-weight: 600; background: #fff; border: 1px solid var(--border-dk); color: var(--navy); border-radius: 6px; padding: 3px 9px; }
.prev-foot { font-size: 11px; }
.exports { display: flex; align-items: center; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
.exp-label { font-size: 12px; font-weight: 700; color: var(--ink-2); margin-right: 4px; }
.busy { font-size: 12.5px; color: var(--gold); font-weight: 600; }
.cat-btns { display: flex; gap: 6px; flex-wrap: wrap; }
@media (max-width: 720px) { .selectors, .prev-summary { grid-template-columns: 1fr; } }
</style>
