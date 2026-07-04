<template>
  <div class="page">
    <div class="page-head">
      <div class="eyebrow">Consolidation studio · Structured data to SBS template</div>
      <h1>Consolidation studio</h1>
      <p>Capture each offtaker's figures for the period once. The studio computes the consolidated dashboard, split KPMD and MTLDK, pulls the offtakers' own field photos, and generates the consolidated report on the SBS template in PowerPoint or Word. Feeds outputs 4, 8 and 10.</p>
    </div>

    <div class="card card-pad controls">
      <div>
        <label class="field-label">Report</label>
        <select class="select" v-model="periodType" @change="load">
          <option value="monthly">Monthly consolidated</option>
          <option value="quarterly">Quarterly consolidated (with P&amp;L)</option>
        </select>
      </div>
      <div>
        <label class="field-label">Period label</label>
        <input class="input" v-model="periodLabel" placeholder="e.g. June 2026 or Q2 2026" @blur="load" />
      </div>
      <div class="ctrl-actions">
        <button class="btn" @click="save">Save draft</button>
        <button class="btn primary" :disabled="busy" @click="generatePptx"><span v-html="ICON.ppt"></span> PowerPoint</button>
        <button class="btn gold" :disabled="busy" @click="generateDocx"><span v-html="ICON.word"></span> Word</button>
      </div>
    </div>
    <div class="storage-line">
      <span class="pill" :class="shared ? 'green' : 'grey'"><span class="dot"></span>{{ shared ? 'Shared with the team (Drive)' : 'Saved to this browser' }}</span>
      <span v-if="status" class="muted" style="font-size:12px">{{ status }}</span>
    </div>

    <div class="section-title">Consolidated dashboard (live)</div>
    <div class="card">
      <table class="data">
        <thead><tr><th>Metric</th><th class="num">KPMD</th><th class="num">MTLDK</th><th class="num">Total</th><th class="num">Target</th><th style="width:150px">% of target</th></tr></thead>
        <tbody>
          <tr v-for="m in model.metrics" :key="m.label">
            <td class="strong">{{ m.label }}</td>
            <td class="num">{{ fmt(m.kpmd) }}</td>
            <td class="num">{{ fmt(m.mtldk) }}</td>
            <td class="num strong">{{ fmt(m.total) }}</td>
            <td class="num muted">{{ fmt(m.target) }}</td>
            <td><ProgressBar :value="m.pct" :rag="m.pct >= 90 ? 'green' : m.pct >= 60 ? 'amber' : 'red'" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section-title">Offtaker figures for the period</div>
    <div class="note" style="margin-bottom:14px">Edit the cells below. Numbers drive the dashboard above and the generated report. Highlights, challenges and next steps become the narrative slides.</div>

    <div v-for="track in ['KPMD','MTLDK']" :key="track" class="card track-card">
      <div class="card-head"><h3>{{ track }} counties</h3><span class="sub">{{ rowsFor(track).length }} operations</span></div>
      <div class="grid-scroll">
        <table class="data entry">
          <thead>
            <tr>
              <th style="min-width:150px">Offtaker / county</th>
              <th class="num">HH</th><th class="num">Female</th><th class="num">Goats</th><th class="num">Sheep</th>
              <th style="min-width:180px">Highlight</th><th style="min-width:170px">Challenge</th><th style="min-width:170px">Next step</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rowsFor(track)" :key="row.offtakerId + row.county">
              <td><div class="strong">{{ row.offtaker }}</div><div class="muted" style="font-size:11.5px">{{ row.county }}</div></td>
              <td><input class="cell num" v-model.number="row.hh" /></td>
              <td><input class="cell num" v-model.number="row.female" /></td>
              <td><input class="cell num" v-model.number="row.goats" /></td>
              <td><input class="cell num" v-model.number="row.sheep" /></td>
              <td><input class="cell" v-model="row.highlight" placeholder="—" /></td>
              <td><input class="cell" v-model="row.challenge" placeholder="—" /></td>
              <td><input class="cell" v-model="row.nextStep" placeholder="—" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="periodType === 'quarterly'" class="card track-card">
      <div class="card-head"><h3>Offtaker business (P&amp;L)</h3><span class="sub">Quarterly, KES</span></div>
      <table class="data entry">
        <thead><tr><th>Offtaker</th><th class="num">Total revenue</th><th class="num">Total costs</th><th class="num">Net income</th></tr></thead>
        <tbody>
          <tr v-for="p in pnl" :key="p.offtakerId">
            <td class="strong">{{ p.offtaker }}</td>
            <td><input class="cell num" v-model.number="p.revenue" /></td>
            <td><input class="cell num" v-model.number="p.costs" /></td>
            <td><input class="cell num" v-model.number="p.netIncome" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section-title">Field highlight photos</div>
    <div class="note" style="margin-bottom:14px">Pull the offtakers' own photos from their most recent uploaded report and add the best ones to the consolidated deck. Requires Drive to be connected and a report on file.</div>

    <div class="card track-card" v-for="o in OFFTAKERS" :key="o.id">
      <div class="card-head">
        <h3>{{ o.name }}</h3>
        <button class="btn sm" :disabled="!deckFor(o.id)" @click="pull(o)">{{ deckFor(o.id) ? 'Pull photos from report' : 'No report on file' }}</button>
      </div>
      <div class="card-pad">
        <div v-if="offtakerImages[o.id] && offtakerImages[o.id].length" class="gallery">
          <button v-for="img in offtakerImages[o.id]" :key="img.name" class="thumb" @click="add(o, img)" :title="'Add ' + img.name">
            <img :src="img.dataUrl" alt="" />
            <span class="thumb-add">＋</span>
          </button>
        </div>
        <div v-else class="muted" style="font-size:12.5px">{{ pulled[o.id] ? 'No photos found in the latest report.' : 'Not pulled yet.' }}</div>

        <div v-if="photosFor(o.id).length" class="attached">
          <div v-for="(p, i) in photosFor(o.id)" :key="i" class="att">
            <img :src="thumbFor(p)" alt="" />
            <input class="cell" v-model="p.caption" placeholder="Caption (optional)" />
            <button class="att-x" @click="removeByRef(p)">Remove</button>
          </div>
        </div>
      </div>
    </div>

    <div class="note" style="margin-top:18px">
      <b>One data spine.</b> These figures and photos are the same source that drives the live tiers and the submission tracker. Capture once, and the live dashboard, the accountability reports and the consolidated deck move together.
    </div>
  </div>
</template>

<script setup>
const {
  periodType, periodLabel, rows, pnl, photos, offtakerImages, busy, shared, status, model,
  load, save, loadImages, addPhoto, removePhoto, generatePptx, generateDocx
} = useConsolidation()
const { files, configured, load: loadLibrary, OFFTAKERS } = useReporting()

const pulled = reactive({})

onMounted(async () => { await load(); await loadLibrary() })

const rowsFor = (track) => rows.value.filter((r) => r.track === track)
const fmt = (n) => (n === null || n === undefined || n === '') ? '-' : Number(n).toLocaleString('en-US')

// Latest real (non-demo) uploaded deck for an offtaker.
const deckFor = (offtakerId) => {
  const list = files.value
    .filter((f) => f.offtaker === offtakerId && f.id && !String(f.id).startsWith('demo') && /presentation|\.pptx$/i.test((f.mimeType || '') + f.name))
    .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
  return list[0] || null
}
const trackFor = (o) => (o.kpmd && o.kpmd.length ? 'KPMD' : 'MTLDK')

const pull = async (o) => {
  const deck = deckFor(o.id)
  if (!deck) return
  await loadImages(o.id, deck.id)
  pulled[o.id] = true
}
const add = (o, img) => addPhoto({ offtakerId: o.id, name: o.name }, img, trackFor(o))
const photosFor = (offtakerId) => photos.value.filter((p) => p.offtakerId === offtakerId)
const removeByRef = (p) => removePhoto(photos.value.indexOf(p))
const thumbFor = (p) => {
  const cache = offtakerImages[p.offtakerId]
  const img = cache && cache.find((i) => i.name === p.name)
  return img ? img.dataUrl : ''
}

const ICON = {
  ppt: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M9 17v-5h2.5a1.5 1.5 0 0 1 0 3H9"/></svg>',
  word: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 13l1.5 4 1.5-4 1.5 4 1.5-4"/></svg>'
}
</script>

<style scoped>
.controls { display: grid; grid-template-columns: 1fr 1fr auto; gap: 16px; align-items: end; }
.ctrl-actions { display: flex; gap: 8px; align-items: end; }
.storage-line { display: flex; align-items: center; gap: 12px; margin: 10px 2px 4px; }
.track-card { margin-bottom: 16px; }
.grid-scroll { overflow-x: auto; }
table.entry td { padding: 6px 8px; }
.cell { width: 100%; min-width: 60px; border: 1px solid var(--border); border-radius: 7px; padding: 6px 8px; font-family: inherit; font-size: 12.5px; color: var(--ink); background: #fff; }
.cell:focus { outline: none; border-color: var(--navy); }
.cell.num { text-align: right; font-variant-numeric: tabular-nums; }
.gallery { display: flex; flex-wrap: wrap; gap: 10px; }
.thumb { position: relative; width: 118px; height: 80px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; cursor: pointer; padding: 0; background: #f4f6fa; }
.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.thumb-add { position: absolute; right: 4px; bottom: 4px; background: var(--navy); color: #fff; width: 20px; height: 20px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
.thumb:hover { border-color: var(--gold); }
.attached { margin-top: 14px; display: flex; flex-direction: column; gap: 10px; }
.att { display: flex; align-items: center; gap: 12px; }
.att img { width: 64px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border); }
.att .cell { flex: 1; }
.att-x { background: none; border: none; color: var(--red); font-weight: 600; font-size: 12px; cursor: pointer; font-family: inherit; }
@media (max-width: 820px) { .controls { grid-template-columns: 1fr; } .ctrl-actions { flex-wrap: wrap; } }
</style>
