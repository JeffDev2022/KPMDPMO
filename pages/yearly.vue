<template>
  <div class="page">
    <div class="page-head">
      <div class="eyebrow">Yearly tier · Prove impact</div>
      <h1>Annual impact reporting</h1>
      <p>The governance and donor view across the life of the investment. The four formal impact reports, with baseline, midline and endline analysis, and the value-for-money position. Feeds outputs 12 to 15.</p>
    </div>

    <div class="grid grid-3">
      <KpiCard label="Reporting cycle" value="2026 to 2029" meta="Four annual reports" outputs="12-15" />
      <KpiCard label="First report readiness" value="12%" meta="Due 31 Dec 2026" outputs="12" />
      <KpiCard label="Programme spend" :value="fmtUsd(programme.spentUsd)" :meta="'of ' + fmtUsd(programme.budgetUsd) + ' committed'" outputs="8" />
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-head"><h3>Impact report schedule</h3><span class="sub">Outputs 12 to 15</span></div>
      <table class="data">
        <thead><tr><th>Year</th><th>Report</th><th>Analysis</th><th>Due</th><th style="width:200px">Readiness</th><th>Status</th></tr></thead>
        <tbody>
          <tr v-for="r in impact.rows" :key="r.year">
            <td class="strong">{{ r.year }}</td>
            <td>{{ r.report }}</td>
            <td class="muted">{{ r.analysis }}</td>
            <td>{{ fmtDate(r.due) }}</td>
            <td><ProgressBar :value="r.readiness" :rag="r.readiness > 0 ? 'amber' : 'grey'" /></td>
            <td><StatusPill :rag="r.readiness > 0 ? 'amber' : 'grey'" :label="r.readiness > 0 ? 'In preparation' : 'Scheduled'" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="grid grid-2" style="margin-top:16px">
      <div class="card card-pad">
        <h3 style="margin-bottom:6px">Outcome trajectory</h3>
        <p class="muted" style="font-size:12px; margin-bottom:16px">Leading indicators foreshadow the annual lagging measures</p>
        <BarChart :items="trajectory" />
      </div>
      <div class="card card-pad">
        <h3 style="margin-bottom:14px">How the year settles</h3>
        <p style="font-size:13px; color:var(--ink-2); line-height:1.6">
          The annual impact number is never a surprise. It is the settled total of the daily and weekly
          figures the team has watched all year. Each operational measure on the daily tier rolls into the
          weekly scorecard, the monthly board and the quarterly MEAL set, and lands here.
        </p>
        <div class="chain">
          <span class="chain-node">Daily</span><span class="chain-arrow">→</span>
          <span class="chain-node">Weekly</span><span class="chain-arrow">→</span>
          <span class="chain-node">Monthly</span><span class="chain-arrow">→</span>
          <span class="chain-node">Quarterly</span><span class="chain-arrow">→</span>
          <span class="chain-node gold">Yearly</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { impact, programme, meal, fmtUsd } = useProgrammeData()
const fmtDate = (s) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
const trajectory = computed(() => meal.slice(0, 4).map((m) => ({
  label: m.name.split(' ').slice(0, 2).join(' '),
  value: Math.round(((m.current - m.baseline) / ((m.target - m.baseline) || 1)) * 100),
  display: Math.round(((m.current - m.baseline) / ((m.target - m.baseline) || 1)) * 100) + '%',
  color: '#1f3864'
})))
</script>

<style scoped>
.chain { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; margin-top: 20px; }
.chain-node { font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 20px; background: var(--grey-soft); color: var(--navy); }
.chain-node.gold { background: var(--gold); color: #fff; }
.chain-arrow { color: var(--ink-3); }
</style>
