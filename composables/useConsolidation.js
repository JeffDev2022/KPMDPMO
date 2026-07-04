// ---------------------------------------------------------------------------
// Consolidation Studio data layer.
//
// Captures each offtaker-county's figures once, computes the consolidated
// dashboard (KPMD and MTLDK split, actual vs target), pulls the offtakers' own
// field photos from their uploaded decks, and generates the consolidated report
// on the SBS template. Figures are stored in Drive (shared across the team) when
// signed in and configured, and fall back to this browser otherwise.
// ---------------------------------------------------------------------------
import { buildDeck, buildDoc } from '~/utils/deckBuilder.js'

const SEED_ROWS = [
  { offtakerId: 'genco', offtaker: 'Genco', county: 'Samburu', track: 'KPMD', hh: 96, female: 52, goats: 1180, sheep: 640, hhT: 110, goatsT: 1300, sheepT: 700 },
  { offtakerId: 'genco', offtaker: 'Genco', county: 'Turkana', track: 'MTLDK', hh: 41, female: 18, goats: 410, sheep: 190, hhT: 80, goatsT: 700, sheepT: 300 },
  { offtakerId: 'livemo', offtaker: 'LiveMo', county: 'Kajiado', track: 'KPMD', hh: 138, female: 74, goats: 1620, sheep: 940, hhT: 150, goatsT: 1800, sheepT: 1000 },
  { offtakerId: 'livemo', offtaker: 'LiveMo', county: 'Kilifi', track: 'MTLDK', hh: 44, female: 21, goats: 300, sheep: 160, hhT: 90, goatsT: 600, sheepT: 300 },
  { offtakerId: 'livemo', offtaker: 'LiveMo', county: 'Laikipia', track: 'MTLDK', hh: 33, female: 15, goats: 240, sheep: 120, hhT: 70, goatsT: 500, sheepT: 250 },
  { offtakerId: 'abf', offtaker: 'ABF', county: 'Narok', track: 'KPMD', hh: 63, female: 16, goats: 3092, sheep: 1180, hhT: 100, goatsT: 3400, sheepT: 1300 },
  { offtakerId: 'abf', offtaker: 'ABF', county: 'Tana River', track: 'MTLDK', hh: 10, female: 2, goats: 0, sheep: 0, hhT: 200, goatsT: 400, sheepT: 200 },
  { offtakerId: 'chillzone', offtaker: 'ChillZone', county: 'Baringo', track: 'MTLDK', hh: 88, female: 47, goats: 980, sheep: 520, hhT: 100, goatsT: 1100, sheepT: 600 },
  { offtakerId: 'chillzone', offtaker: 'ChillZone', county: 'Nakuru', track: 'MTLDK', hh: 52, female: 28, goats: 540, sheep: 300, hhT: 70, goatsT: 700, sheepT: 350 },
  { offtakerId: 'sowle', offtaker: 'Sowle', county: 'Isiolo', track: 'MTLDK', hh: 47, female: 19, goats: 420, sheep: 220, hhT: 90, goatsT: 700, sheepT: 350 }
]
const SEED_PNL = [
  { offtakerId: 'genco', offtaker: 'Genco', revenue: 42000000, costs: 33000000, netIncome: 9000000 },
  { offtakerId: 'chillzone', offtaker: 'ChillZone', revenue: 36000000, costs: 28000000, netIncome: 8000000 },
  { offtakerId: 'sowle', offtaker: 'Sowle', revenue: 21000000, costs: 19500000, netIncome: 1500000 },
  { offtakerId: 'livemo', offtaker: 'LiveMo', revenue: 55000000, costs: 42000000, netIncome: 13000000 },
  { offtakerId: 'abf', offtaker: 'ABF', revenue: 291909437, costs: 285000000, netIncome: 6909437 }
]
const freshRows = () => SEED_ROWS.map((r) => ({ ...r, highlight: '', challenge: '', nextStep: '' }))

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = fileName
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export function useConsolidation() {
  const periodType = ref('monthly')
  const periodLabel = ref('')
  const rows = ref(freshRows())
  const pnl = ref(SEED_PNL.map((p) => ({ ...p })))
  const photos = ref([])                 // refs: { offtakerId, offtaker, fileId, name, caption, track }
  const offtakerImages = reactive({})    // cache: { offtakerId: [ {name, dataUrl} ] }
  const busy = ref(false)
  const shared = ref(false)              // true when saving to Drive
  const status = ref('')

  const storageKey = () => `kpmd_consol_${periodType.value}_${periodLabel.value || 'draft'}`

  const applyData = (d) => {
    if (d?.rows) rows.value = d.rows
    else rows.value = freshRows()
    pnl.value = d?.pnl || SEED_PNL.map((p) => ({ ...p }))
    photos.value = d?.photos || []
  }

  const load = async () => {
    // Try shared Drive storage first (needs a signed-in token).
    if (import.meta.client) {
      try {
        const { getToken } = useAuth()
        const token = await getToken()
        if (token) {
          const res = await fetch(`/.netlify/functions/consolidation?periodType=${encodeURIComponent(periodType.value)}&period=${encodeURIComponent(periodLabel.value || '')}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const data = await res.json()
          if (res.ok && data.configured) {
            shared.value = true
            applyData(data.data)
            return
          }
        }
      } catch (e) { /* fall through to local */ }
      // Local fallback
      shared.value = false
      try {
        const raw = localStorage.getItem(storageKey())
        if (raw) { applyData(JSON.parse(raw)); return }
      } catch (e) { /* ignore */ }
    }
    applyData(null)
  }

  const save = async () => {
    const payload = { rows: rows.value, pnl: pnl.value, photos: photos.value }
    if (import.meta.client) {
      const { getToken } = useAuth()
      const token = await getToken()
      if (token && shared.value) {
        try {
          const res = await fetch('/.netlify/functions/consolidation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ periodType: periodType.value, period: periodLabel.value, data: payload })
          })
          const d = await res.json()
          status.value = res.ok ? 'Saved to Drive' : ('Save failed: ' + (d.error || res.status))
          return
        } catch (e) { status.value = 'Save failed: ' + (e.message || e); return }
      }
      localStorage.setItem(storageKey(), JSON.stringify(payload))
      status.value = 'Saved to this browser'
    }
  }

  // Pull the offtaker's own photos out of their uploaded deck.
  const loadImages = async (offtakerId, fileId) => {
    if (!import.meta.client || !fileId) return
    if (offtakerImages[offtakerId]) return
    const { getToken } = useAuth()
    const token = await getToken()
    if (!token) return
    const res = await fetch(`/.netlify/functions/deck-images?fileId=${encodeURIComponent(fileId)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    offtakerImages[offtakerId] = (data.images || []).map((im) => ({ ...im, fileId }))
  }

  const addPhoto = (offtaker, img, track) => {
    photos.value.push({ offtakerId: offtaker.offtakerId, offtaker: offtaker.name, fileId: img.fileId, name: img.name, caption: '', track: track || 'MTLDK' })
  }
  const removePhoto = (i) => photos.value.splice(i, 1)

  const num = (v) => Number(v) || 0
  const sumBy = (list, key) => list.reduce((s, r) => s + num(r[key]), 0)

  const model = computed(() => {
    const kpmd = rows.value.filter((r) => r.track === 'KPMD')
    const mtldk = rows.value.filter((r) => r.track === 'MTLDK')
    const pctFemale = (list) => { const h = sumBy(list, 'hh'); return h ? Math.round((sumBy(list, 'female') / h) * 100) : 0 }
    const metric = (label, key, tKey) => {
      const k = sumBy(kpmd, key), m = sumBy(mtldk, key), total = k + m
      const target = tKey ? sumBy(rows.value, tKey) : 0
      return { label, kpmd: k, mtldk: m, total, target, pct: target ? Math.round((total / target) * 100) : 0 }
    }
    const metrics = [
      metric('Registered pastoralists (HH)', 'hh', 'hhT'),
      metric('Female farmers', 'female', null),
      { label: '% female farmers', kpmd: pctFemale(kpmd), mtldk: pctFemale(mtldk), total: pctFemale(rows.value), target: 50, pct: Math.round((pctFemale(rows.value) / 50) * 100) },
      metric('Goats purchased', 'goats', 'goatsT'),
      metric('Sheep purchased', 'sheep', 'sheepT')
    ]
    return {
      meta: {
        investmentId: 'INV 093207',
        periodType: periodType.value,
        periodLabel: periodLabel.value || (periodType.value === 'quarterly' ? 'Current quarter' : 'Current month'),
        preparedBy: 'Prof. Ruth Kiraka and Dr. Geoffrey Otieno',
        generatedAt: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      },
      metrics,
      perOfftaker: rows.value.map((r) => ({ offtaker: r.offtaker, county: r.county, track: r.track, hh: r.hh, female: r.female, goats: r.goats, sheep: r.sheep })),
      narrative: rows.value.map((r) => ({ offtaker: r.offtaker, county: r.county, track: r.track, highlight: r.highlight, challenge: r.challenge, nextStep: r.nextStep })),
      pnl: pnl.value
    }
  })

  // Resolve photo refs to data URLs (fetching any not yet cached).
  const resolvePhotos = async () => {
    const out = []
    for (const ref of photos.value) {
      let cache = offtakerImages[ref.offtakerId]
      if (!cache && ref.fileId) { await loadImages(ref.offtakerId, ref.fileId); cache = offtakerImages[ref.offtakerId] }
      const img = cache && cache.find((i) => i.name === ref.name)
      if (img) out.push({ offtaker: ref.offtaker, track: ref.track, caption: ref.caption, dataUrl: img.dataUrl })
    }
    return out
  }

  const fileBase = () => `KPMD_${periodType.value === 'quarterly' ? 'Quarterly' : 'Monthly'}_Consolidated_${(periodLabel.value || 'draft').replace(/[^a-z0-9]+/gi, '-')}`

  const generatePptx = async () => {
    busy.value = true
    try {
      const m = { ...model.value, photos: await resolvePhotos() }
      const pptx = await buildDeck(m)
      await pptx.writeFile({ fileName: fileBase() + '.pptx' })
    } catch (e) { if (import.meta.client) alert('PowerPoint generation failed: ' + (e.message || e)) }
    finally { busy.value = false }
  }
  const generateDocx = async () => {
    busy.value = true
    try {
      const m = { ...model.value, photos: await resolvePhotos() }
      const { doc, Packer } = await buildDoc(m)
      const blob = await Packer.toBlob(doc)
      downloadBlob(blob, fileBase() + '.docx')
    } catch (e) { if (import.meta.client) alert('Word generation failed: ' + (e.message || e)) }
    finally { busy.value = false }
  }

  return {
    periodType, periodLabel, rows, pnl, photos, offtakerImages, busy, shared, status, model,
    load, save, loadImages, addPhoto, removePhoto, generatePptx, generateDocx
  }
}
