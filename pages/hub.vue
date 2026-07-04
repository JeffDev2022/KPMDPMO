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
            <option v-for="t in REPORT_TYPES" :key="t.id" :value="t.id">{{ t.label }}</option>
          </select>
        </div>
        <div>
          <label class="field-label">Offtaker</label>
          <select class="select" v-model="up.offtaker">
            <option v-for="o in OFFTAKERS" :key="o.id" :value="o.id">{{ o.name }}</option>
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
              <td><TrackerCell :cell="row.weekly" :offtaker="row.name" type="weekly" /></td>
              <td><TrackerCell :cell="row.monthly" :offtaker="row.name" type="monthly" /></td>
              <td><TrackerCell :cell="row.quarterly" :offtaker="row.name" type="quarterly" /></td>
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
          <option v-for="t in REPORT_TYPES" :key="t.id" :value="t.id">{{ t.label }}</option>
        </select>
      </div>
      <div>
        <label class="field-label">Offtaker</label>
        <select class="select" v-model="filterOfftaker">
          <option value="">All offtakers</option>
          <option v-for="o in OFFTAKERS" :key="o.id" :value="o.id">{{ o.name }}</option>
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
            <td><span class="tag-outputs">{{ typeLabel(f.reportType) }}</span></td>
            <td class="muted">{{ offtakerName(f.offtaker) }}</td>
            <td class="muted">{{ f.period }}</td>
            <td class="muted">{{ fmtDate(f.createdTime) }}</td>
            <td class="num"><a v-if="f.link && f.link !== '#demo'" :href="f.link" target="_blank" class="link">Open ↗</a><span v-else class="muted" style="font-size:11.5px">demo</span></td>
          </tr>
          <tr v-if="!filteredFiles.length"><td colspan="6" class="muted" style="text-align:center; padding:20px">No files match.</td></tr>
        </tbody>
      </table>
    </div>

    <div class="note" style="margin-top:18px">
      <b>Next: consolidation.</b> Phase two adds the consolidation studio. Capture each offtaker's headline figures once, and the hub generates the consolidated monthly and quarterly decks on the SBS template, downloadable in PowerPoint or Word, from the same numbers that drive the live tiers.
    </div>
  </div>
</template>

<script setup>
const {
  files, configured, periods, load, tracker, summary,
  uploadReport, OFFTAKERS, REPORT_TYPES
} = useReporting()

onMounted(load)

const showUpload = ref(false)
const up = reactive({ reportType: 'weekly', offtaker: 'genco', period: '', file: null })
const uploading = ref(false)
const uploadMsg = ref('')

watchEffect(() => { if (!up.period) up.period = periods[up.reportType] })

const onFile = (e) => { up.file = e.target.files?.[0] || null }
const canUpload = computed(() => up.file && up.reportType && up.offtaker && up.period && configured.value)
const doUpload = async () => {
  if (!configured.value) { uploadMsg.value = 'Drive not configured yet. Connect it to enable upload.'; return }
  uploading.value = true; uploadMsg.value = ''
  try {
    await uploadReport(up.file, { reportType: up.reportType, offtaker: up.offtaker, period: up.period || periods[up.reportType] })
    uploadMsg.value = 'Uploaded.'
    up.file = null
  } catch (e) {
    uploadMsg.value = 'Upload failed: ' + (e.message || e)
  } finally {
    uploading.value = false
  }
}

const filterType = ref('')
const filterOfftaker = ref('')
const filteredFiles = computed(() => files.value.filter((f) =>
  (!filterType.value || f.reportType === filterType.value) &&
  (!filterOfftaker.value || f.offtaker === filterOfftaker.value)
))

const typeLabel = (id) => REPORT_TYPES.find((t) => t.id === id)?.label || id || '—'
const offtakerName = (id) => OFFTAKERS.find((o) => o.id === id)?.name || id || '—'
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
@media (max-width: 820px) { .up-grid { grid-template-columns: 1fr 1fr; } .filters { grid-template-columns: 1fr; } }
</style>
