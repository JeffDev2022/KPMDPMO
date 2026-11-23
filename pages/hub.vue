<template>
  <div class="page">
    <div class="page-head">
      <div class="eyebrow">Reporting Hub · Weekly, monthly and quarterly submissions</div>
      <h1>Reporting Hub</h1>
      <p>Upload and store every offtaker report in one place, track who has and has not submitted, and prepare consolidated reports. Files are stored in the programme Google Drive. Feeds outputs 4, 8 and 10.</p>
    </div>

    <div v-if="!configured" class="note" style="margin-bottom:18px">
      <b>Demo data.</b> The Google Drive connection is not yet configured, so the tracker below shows illustrative status. Once the service account and Drive folder are set in Netlify (see the setup guide), this reads live from Drive. Upload will activate at the same time.
    </div>

    <div class="grid grid-4" style="margin-bottom:18px">
      <KpiCard label="Weekly reports in" :value="summary.weekly + ' / ' + summary.total" :meta="'Week ' + periods.weekly.split('-W')[1]" :trend="summary.weekly === summary.total ? 'up' : 'down'" outputs="4, 10" />
      <KpiCard label="Monthly in" :value="summary.monthly + ' / ' + summary.total" meta="Due by the 28th" outputs="8" />
      <KpiCard label="Quarterly P&amp;L outstanding" :value="summary.quarterlyOutstanding" :meta="periods.quarterly" :trend="summary.quarterlyOutstanding ? 'down' : 'up'" outputs="8" />
      <KpiCard label="Files stored" :value="files.length" :meta="configured ? 'In Google Drive' : 'Demo set'" outputs="10" />
    </div>

    <div class="flex between center" style="margin-bottom:12px">
      <div class="section-title" style="margin:0">Submission tracker</div>
      <button class="btn primary sm" @click="showUpload = !showUpload"><span>＋</span> Upload report</button>
    </div>

    <div v-if="showUpload" class="card card-pad upload-panel">
      <div class="up-grid">
        <div>
          <label class="field-label">Report type</label>
          <select class="select" v-model="up.reportType">
            <option v-for="t in reportTypeOptions" :key="t.id" :value="t.id">{{ t.label }}</option>
          </select>
        </div>
        <div>
          <label class="field-label">Offtaker</label>
          <select class="select" v-model="up.offtaker">
            <option v-for="o in OFFTAKERS" :key="o.id" :value="o.id">{{ o.name }}</option>
            <option value="consolidated">Consolidated (all offtakers)</option>
          </select>
        </div>
        <div>
          <label class="field-label">Period</label>
          <input class="input" v-model="up.period" :placeholder="periods[up.reportType]" />
        </div>
        <div>
          <label class="field-label">File</label>
          <input class="input file" type="file" @change="onFile" accept=".pptx,.ppt,.docx,.doc,.xlsx,.xls,.pdf" />
        </div>
      </div>
      <div class="flex between center" style="margin-top:14px">
        <div class="muted" style="font-size:12px">{{ uploadMsg }}</div>
        <button class="btn gold" :disabled="!canUpload || uploading" @click="doUpload">{{ uploading ? 'Uploading…' : 'Upload to Drive' }}</button>
      </div>
    </div>

    <div class="card">
      <div class="tbl-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>Offtaker</th>
              <th>Weekly · {{ periods.weekly }}</th>
              <th>Monthly · {{ periods.monthly }}</th>
              <th>Quarterly · {{ periods.quarterly }} + P&amp;L</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in tracker" :key="row.id">
              <td>
                <div class="strong">{{ row.name }}</div>
                <div class="muted" style="font-size:11.5px">{{ row.counties }}</div>
              </td>
              <td><TrackerCell :cell="row.weekly" :offtaker="row.name" type="weekly" :downloading="downloadingId" @download="download" /></td>
              <td><TrackerCell :cell="row.monthly" :offtaker="row.name" type="monthly" :downloading="downloadingId" @download="download" /></td>
              <td><TrackerCell :cell="row.quarterly" :offtaker="row.name" type="quarterly" :downloading="downloadingId" @download="download" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="section-title">Report library</div>
    <div class="card card-pad filters">
      <div>
        <label class="field-label">Type</label>
        <select class="select" v-model="filterType">
          <option value="">All types</option>
          <option v-for="t in ALL_TYPES" :key="t.id" :value="t.id">{{ t.label }}</option>
        </select>
      </div>
      <div>
        <label class="field-label">Offtaker</label>
        <select class="select" v-model="filterOfftaker">
          <option value="">All offtakers</option>
          <option v-for="o in OFFTAKERS" :key="o.id" :value="o.id">{{ o.name }}</option>
          <option value="consolidated">Consolidated</option>
        </select>
      </div>
      <div class="result-count">{{ filteredFiles.length }} file{{ filteredFiles.length === 1 ? '' : 's' }}</div>
    </div>

    <div class="card" style="margin-top:16px">
      <table class="data">
        <thead><tr><th>File</th><th>Type</th><th>Offtaker</th><th>Period</th><th>Received</th><th></th></tr></thead>
        <tbody>
          <tr v-for="f in filteredFiles" :key="f.id">
            <td class="strong">{{ f.name }}</td>
            <td><span class="tag-outputs">{{ fileTypeLabel(f) }}</span></td>
            <td class="muted">{{ offtakerName(f) }}</td>
            <td class="muted">{{ f.period }}</td>
            <td class="muted">{{ fmtDate(f.createdTime) }}</td>
            <td class="num"><button v-if="f.id && f.link !== '#demo'" class="linkbtn" :disabled="downloadingId === f.id" @click="download(f)">{{ downloadingId === f.id ? 'Downloading…' : 'Download ↓' }}</button><span v-else class="muted" style="font-size:11.5px">demo</span></td>
          </tr>
          <tr v-if="!filteredFiles.length"><td colspan="6" class="muted" style="text-align:center; padding:20px">No files match.</td></tr>
        </tbody>
      </table>
      <div v-if="downloadMsg" class="dl-error">{{ downloadMsg }}</div>
    </div>

    <div class="note" style="margin-top:18px">
      <b>Consolidated reports.</b> Pick <b>Consolidated (all offtakers)</b> in the upload panel to store the single summary of every offtaker report for a weekly, monthly, quarterly or yearly period. These land under a dedicated <b>Consolidated</b> folder in the programme Drive and are listed above alongside the offtaker submissions.
    </div>
  </div>
</template>

<script setup>
const {
  files, configured, periods, load, tracker, summary,
  uploadReport, downloadFile, OFFTAKERS, REPORT_TYPES, CONSOLIDATED_TYPES
} = useReporting()

onMounted(load)

// Download a stored report, with a transient per-file state for the button and
// a shared error line. downloadingId drives the "Downloading…" label.
const downloadingId = ref('')
const downloadMsg = ref('')
const download = async (f) => {
  if (!f || downloadingId.value) return
  downloadingId.value = f.id
  downloadMsg.value = ''
  try {
    await downloadFile(f)
  } catch (e) {
    downloadMsg.value = `Could not download ${f.name}: ${e.message || e}`
  } finally {
    downloadingId.value = ''
  }
}

const showUpload = ref(false)
const up = reactive({ reportType: 'weekly', offtaker: 'genco', period: '', file: null })
const uploading = ref(false)
const uploadMsg = ref('')

// A consolidated report is programme-level: it can be weekly, monthly, quarterly
// or yearly. Offtaker submissions stay weekly/monthly/quarterly.
const isConsolidated = computed(() => up.offtaker === 'consolidated')
const reportTypeOptions = computed(() => isConsolidated.value ? CONSOLIDATED_TYPES : REPORT_TYPES)

// If we leave the consolidated selection while on a consolidated-only cadence
// (yearly), fall back to a cadence the offtaker actually reports on.
watch(() => up.offtaker, () => {
  if (!isConsolidated.value && !REPORT_TYPES.some((t) => t.id === up.reportType)) {
    up.reportType = 'weekly'
  }
})

// Keep the period in step with the selected cadence.
watch(() => up.reportType, (t) => { up.period = periods[t] }, { immediate: true })

const onFile = (e) => { up.file = e.target.files?.[0] || null }
const canUpload = computed(() => up.file && up.reportType && up.offtaker && up.period && configured.value)
const doUpload = async () => {
  if (!configured.value) { uploadMsg.value = 'Drive not configured yet. Connect it to enable upload.'; return }
  uploading.value = true; uploadMsg.value = ''
  try {
    await uploadReport(up.file, {
      reportType: up.reportType,
      offtaker: up.offtaker,
      period: up.period || periods[up.reportType],
      scope: isConsolidated.value ? 'consolidated' : 'offtaker'
    })
    uploadMsg.value = 'Uploaded.'
    up.file = null
  } catch (e) {
    uploadMsg.value = 'Upload failed: ' + (e.message || e)
  } finally {
    uploading.value = false
  }
}

// Report library. Consolidated files carry scope 'consolidated' (no offtaker),
// so they surface under the "Consolidated" filter and label.
const ALL_TYPES = CONSOLIDATED_TYPES   // weekly, monthly, quarterly, yearly
const filterType = ref('')
const filterOfftaker = ref('')
const filteredFiles = computed(() => files.value.filter((f) => {
  const typeOk = !filterType.value || f.reportType === filterType.value
  let offtakerOk
  if (!filterOfftaker.value) offtakerOk = true
  else if (filterOfftaker.value === 'consolidated') offtakerOk = f.scope === 'consolidated'
  else offtakerOk = f.scope !== 'consolidated' && f.offtaker === filterOfftaker.value
  return typeOk && offtakerOk
}))

const fileTypeLabel = (f) => (f.scope === 'consolidated'
  ? CONSOLIDATED_TYPES.find((t) => t.id === f.reportType)?.label
  : REPORT_TYPES.find((t) => t.id === f.reportType)?.label) || f.reportType || '—'
const offtakerName = (f) => f.scope === 'consolidated'
  ? 'Consolidated'
  : (OFFTAKERS.find((o) => o.id === f.offtaker)?.name || f.offtaker || '—')
const fmtDate = (s) => s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
</script>

<style scoped>
.tbl-scroll { overflow-x: auto; }
.upload-panel { margin-bottom: 16px; }
.up-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.filters { display: grid; grid-template-columns: 1fr 1fr auto; gap: 16px; align-items: end; }
.result-count { font-size: 12.5px; color: var(--ink-3); font-weight: 600; padding-bottom: 10px; }
.input.file { padding: 7px 10px; }
.link { color: var(--navy); font-weight: 600; font-size: 12.5px; }
.linkbtn { color: var(--navy); font-weight: 600; font-size: 12.5px; background: none; border: none; padding: 0; cursor: pointer; font-family: inherit; }
.linkbtn:hover { text-decoration: underline; }
.linkbtn:disabled { color: var(--ink-3, #8a94a6); cursor: default; text-decoration: none; }
.dl-error { margin-top: 10px; font-size: 12px; color: var(--red, #c0392b); }
@media (max-width: 820px) { .up-grid { grid-template-columns: 1fr 1fr; } .filters { grid-template-columns: 1fr; } }
</style>
