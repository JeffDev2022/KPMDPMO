<template>
  <div class="page">
    <div class="page-head">
      <div class="eyebrow">Daily tier · Run the operation</div>
      <h1>Daily operations</h1>
      <p>The live operational core for programme staff. Field activity, aggregation volumes and disbursement drawdown, with exceptions surfaced first. Feeds outputs 8 and 10.</p>
    </div>

    <div class="grid grid-4">
      <KpiCard label="Aggregated today" :value="fmtNum(totals.todayVolume) + ' head'" :meta="dayDelta + ' vs yesterday'" :trend="totals.todayVolume >= totals.prevVolume ? 'up' : 'down'" outputs="10" />
      <KpiCard label="Disbursed to date" :value="fmtUsd(totals.disbursed)" :meta="pct(totals.disbursed, totals.facility) + '% of facility'" outputs="8" />
      <KpiCard label="Active counties" :value="totals.countiesActive + ' of 10'" meta="All offtakers reporting" outputs="8" />
      <KpiCard label="Red flags" :value="redFlags.length" meta="Need attention today" :trend="redFlags.length ? 'down' : 'up'" outputs="8, 10" />
    </div>

    <div class="grid grid-3" style="margin-top:16px; grid-template-columns: 2fr 1fr;">
      <div class="card">
        <div class="card-head">
          <h3>Offtaker activity today</h3>
          <span class="sub">Sorted by attainment, lowest first</span>
        </div>
        <table class="data">
          <thead><tr><th>Offtaker</th><th>Counties</th><th class="num">Today</th><th class="num">Week</th><th style="width:120px">Trend (14d)</th><th>Status</th></tr></thead>
          <tbody>
            <tr v-for="o in sortedOfftakers" :key="o.id">
              <td class="strong">{{ o.name }}</td>
              <td class="muted">{{ o.counties.join(', ') }}</td>
              <td class="num strong">{{ o.daily[o.daily.length-1] }}</td>
              <td class="num">{{ o.weekly[o.weekly.length-1] }}</td>
              <td><SparkLine :data="o.daily" :tone="o.rag === 'red' ? 'red' : 'green'" /></td>
              <td><StatusPill :rag="o.rag" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card card-pad">
        <h3 style="margin-bottom:14px">Red flags</h3>
        <div v-if="!redFlags.length" class="muted">No red flags today.</div>
        <div v-for="(f, i) in redFlags" :key="i" class="flag">
          <span class="pill red" style="margin-bottom:6px"><span class="dot"></span>{{ f.offtaker }}</span>
          <div class="flag-txt">{{ f.issue }}</div>
          <div class="flag-owner" v-if="f.owner">Owner: {{ f.owner }}</div>
        </div>
        <div class="section-title" style="margin-top:20px">Programme volume, last 14 days</div>
        <SparkLine :data="programmeDaily" tone="navy" :h="48" />
      </div>
    </div>

    <div class="note" style="margin-top:18px">
      <b>Data freshness.</b> Field aggregation sheet last synced 22 Jun 2026 06:40. Disbursement ledger 21 Jun 18:10. The daily tier carries only what can change within a day, so deliverable and impact figures are not shown here.
    </div>
  </div>
</template>

<script setup>
const { totals, offtakers, redFlags, fmtNum, fmtUsd, pct } = useProgrammeData()
const sortedOfftakers = computed(() => [...offtakers].sort((a, b) => (a.volumeActual / a.volumeTarget) - (b.volumeActual / b.volumeTarget)))
const dayDelta = computed(() => {
  const d = totals.todayVolume - totals.prevVolume
  return (d >= 0 ? '+' : '') + d + ' head'
})
const programmeDaily = computed(() => {
  const len = offtakers[0].daily.length
  return Array.from({ length: len }, (_, i) => offtakers.reduce((s, o) => s + o.daily[i], 0))
})
</script>

<style scoped>
.flag { padding: 10px 0; border-bottom: 1px solid var(--border); }
.flag:last-of-type { border-bottom: none; }
.flag-txt { font-size: 12.5px; color: var(--ink); }
.flag-owner { font-size: 11.5px; color: var(--ink-3); margin-top: 3px; }
</style>
