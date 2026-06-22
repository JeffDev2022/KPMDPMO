<template>
  <div class="page">
    <div class="page-head">
      <div class="eyebrow">Quarterly tier · Account for progress</div>
      <h1>Quarterly accountability brief</h1>
      <p>The donor and governance picture. Funded outputs against target, leverage secured, gender transformation and outcome indicators drawn from the MEAL framework. Feeds outputs 3, 5, 6, 7, 8 and 11.</p>
    </div>

    <div class="grid grid-4">
      <KpiCard label="Households reached" :value="fmtNum(18400)" meta="Target 42,000" outputs="8" />
      <KpiCard label="Leverage secured" :value="fmtUsd(pipeline.securedUsd)" :meta="'of ' + fmtUsd(pipeline.targetLeverageUsd) + ' target'" trend="up" outputs="7" />
      <KpiCard label="Women participating" value="31%" meta="Target 45%" outputs="5" />
      <KpiCard label="Sustainability index" value="69" meta="Baseline 40 · target 80" trend="up" outputs="8" />
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-head"><h3>MEAL indicator movement</h3><span class="sub">Output 3 underpins every figure</span></div>
      <table class="data">
        <thead><tr><th>Indicator</th><th class="num">Baseline</th><th class="num">Current</th><th class="num">Target</th><th style="width:200px">Progress to target</th><th>Output</th></tr></thead>
        <tbody>
          <tr v-for="m in meal" :key="m.name">
            <td class="strong">{{ m.name }}</td>
            <td class="num muted">{{ m.baseline }}</td>
            <td class="num strong">{{ m.current }}</td>
            <td class="num">{{ m.target }} <span class="muted" style="font-size:11px">{{ m.unit }}</span></td>
            <td><ProgressBar :value="toTarget(m)" :rag="rag(m)" /></td>
            <td><span class="tag-outputs">{{ m.deliverable }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="grid grid-2" style="margin-top:16px">
      <div class="card">
        <div class="card-head"><h3>Gender transformation</h3><span class="sub">Output 5</span></div>
        <table class="data">
          <thead><tr><th>Milestone</th><th>Quarter</th><th>Status</th></tr></thead>
          <tbody>
            <tr v-for="(g, i) in gender" :key="i">
              <td>{{ g.milestone }}</td>
              <td class="muted">{{ g.quarter }}</td>
              <td><StatusPill :rag="g.status" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card">
        <div class="card-head"><h3>Stakeholder engagement</h3><span class="sub">Output 6</span></div>
        <table class="data">
          <thead><tr><th>Group</th><th class="num">Engagements</th><th>Note</th><th>Sentiment</th></tr></thead>
          <tbody>
            <tr v-for="(s, i) in stakeholders" :key="i">
              <td class="strong">{{ s.group }}</td>
              <td class="num">{{ s.engagements }}</td>
              <td class="muted" style="font-size:12px">{{ s.note }}</td>
              <td><StatusPill :rag="s.sentiment" :label="s.sentiment === 'green' ? 'Positive' : 'Watch'" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const { meal, gender, stakeholders, pipeline, fmtUsd, fmtNum } = useProgrammeData()
const toTarget = (m) => {
  const span = m.target - m.baseline || 1
  return Math.round(((m.current - m.baseline) / span) * 100)
}
const rag = (m) => {
  const p = toTarget(m)
  return p >= 60 ? 'green' : p >= 30 ? 'amber' : 'red'
}
</script>
