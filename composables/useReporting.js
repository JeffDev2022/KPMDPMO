// ---------------------------------------------------------------------------
// Reporting Hub data layer.
//
// Talks to the Netlify functions (Google Drive) when they are configured, and
// falls back to a realistic demo set otherwise, so the hub renders on the
// current static deploy and lights up fully once the service account is wired.
// ---------------------------------------------------------------------------

// Offtakers and the counties they run in each programme track.
export const OFFTAKERS = [
  { id: 'genco', name: 'Genco', kpmd: ['Samburu'], mtldk: ['Turkana'] },
  { id: 'chillzone', name: 'ChillZone', kpmd: [], mtldk: ['Baringo', 'Nakuru'] },
  { id: 'sowle', name: 'Sowle', kpmd: [], mtldk: ['Isiolo'] },
  { id: 'livemo', name: 'LiveMo', kpmd: ['Kajiado'], mtldk: ['Kilifi', 'Laikipia'] },
  { id: 'abf', name: 'ABF', kpmd: ['Narok'], mtldk: ['Tana River'] }
]

export const REPORT_TYPES = [
  { id: 'weekly', label: 'Weekly', due: 'Each weekly call' },
  { id: 'monthly', label: 'Monthly', due: 'By the 28th' },
  { id: 'quarterly', label: 'Quarterly (with P&L)', due: 'Month after quarter end' }
]

// ---- period helpers --------------------------------------------------------
function isoWeek(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
  return { year: date.getUTCFullYear(), week }
}
export function currentPeriods(ref = new Date()) {
  const { year, week } = isoWeek(ref)
  const month = ref.getMonth() + 1
  const quarter = Math.floor(ref.getMonth() / 3) + 1
  return {
    weekly: `${year}-W${String(week).padStart(2, '0')}`,
    monthly: `${ref.getFullYear()}-${String(month).padStart(2, '0')}`,
    quarterly: `${ref.getFullYear()}-Q${quarter}`
  }
}

// ---- demo fallback (mirrors the current programme picture) -----------------
function demoFiles(periods) {
  const f = (offtaker, reportType, period, name) => ({
    id: `demo-${offtaker}-${reportType}-${period}`,
    name, reportType, period, offtaker, track: '', link: '#demo',
    createdTime: '2026-06-02T08:00:00Z', mimeType:
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', size: 5100000, demo: true
  })
  return [
    f('genco', 'weekly', periods.weekly, 'Genco_Weekly_wk23.pptx'),
    f('chillzone', 'weekly', periods.weekly, 'ChillZone_Weekly_wk23.pptx'),
    f('livemo', 'weekly', periods.weekly, 'LiveMo_Weekly_wk23.pptx'),
    f('abf', 'weekly', periods.weekly, 'ABF_Weekly_wk23.pptx'),
    f('livemo', 'monthly', periods.monthly, 'LiveMo_Monthly_Jun.pptx'),
    f('chillzone', 'quarterly', periods.quarterly, 'ChillZone_Q2_PnL.xlsx')
  ]
}

// ---- tracker computation ---------------------------------------------------
// For each offtaker x report type in the active period, work out received vs
// missing from the file set. Returns rows keyed by offtaker.
export function computeTracker(files, periods) {
  const has = (offtaker, type) => files.find(
    (x) => x.offtaker === offtaker && x.reportType === type && x.period === periods[type]
  )
  return OFFTAKERS.map((o) => {
    const cell = (type) => {
      const file = has(o.id, type)
      return file
        ? { status: 'received', label: 'received', file }
        : { status: 'missing', label: 'not in', file: null }
    }
    return {
      id: o.id, name: o.name,
      counties: [...o.kpmd, ...o.mtldk].join(' \u00b7 '),
      weekly: cell('weekly'), monthly: cell('monthly'), quarterly: cell('quarterly')
    }
  })
}

export function useReporting() {
  const files = ref([])
  const configured = ref(false)
  const loading = ref(false)
  const error = ref('')
  const periods = currentPeriods()

  const load = async () => {
    loading.value = true; error.value = ''
    try {
      const res = await fetch('/.netlify/functions/library')
      const data = await res.json()
      if (data.configured) {
        configured.value = true
        files.value = data.files || []
      } else {
        configured.value = false
        files.value = demoFiles(periods)
      }
    } catch (e) {
      configured.value = false
      files.value = demoFiles(periods)
    } finally {
      loading.value = false
    }
  }

  const tracker = computed(() => computeTracker(files.value, periods))

  const summary = computed(() => {
    const t = tracker.value
    const count = (type) => t.filter((r) => r[type].status === 'received').length
    return {
      weekly: count('weekly'), monthly: count('monthly'), quarterly: count('quarterly'),
      total: OFFTAKERS.length,
      quarterlyOutstanding: OFFTAKERS.length - count('quarterly')
    }
  })

  // Upload: init a resumable session via the function, then PUT bytes to Drive.
  const uploadReport = async (file, meta) => {
    const initRes = await fetch('/.netlify/functions/upload-init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name, mimeType: file.type,
        reportType: meta.reportType, period: meta.period, offtaker: meta.offtaker,
        track: meta.track || '', uploadedBy: meta.uploadedBy || ''
      })
    })
    const init = await initRes.json()
    if (!initRes.ok || !init.sessionUri) throw new Error(init.error || 'init_failed')
    const put = await fetch(init.sessionUri, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file
    })
    if (!put.ok) throw new Error('upload_failed_' + put.status)
    await load()
    return true
  }

  return {
    files, configured, loading, error, periods,
    OFFTAKERS, REPORT_TYPES,
    load, tracker, summary, uploadReport
  }
}
