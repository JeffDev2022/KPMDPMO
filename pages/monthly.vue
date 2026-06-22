<template>
  <div class="page">
    <div class="page-head">
      <div class="flex between center wrap">
        <div>
          <div class="eyebrow">Monthly tier · Steer the programme</div>
          <h1>Monthly programme report</h1>
        </div>
        <span class="audience-badge" :class="role === 'donor' ? 'donor' : 'staff'">{{ roleMeta?.lens }}</span>
      </div>
      <p>The full deliverable status board against target dates, county roll-out, budget burn and co-investment movement. The single view that lets management correct course before quarter end. Feeds outputs 1 to 11.</p>
    </div>

    <div class="grid grid-4">
      <KpiCard label="Outputs complete" :value="totals.completed + ' of ' + totals.deliverableCount" meta="Funded deliverables" outputs="1-15" />
      <KpiCard label="Budget burn" :value="pct(programme.spentUsd, programme.budgetUsd) + '%'" :meta="fmtUsd(programme.spentUsd) + ' of ' + fmtUsd(programme.budgetUsd)" outputs="8" />
      <KpiCard label="County roll-out" :value="totals.countiesActive + ' of 10'" meta="Counties operational" outputs="8" />
      <KpiCard label="Pipeline secured" :value="fmtUsd(pipeline.securedUsd)" :meta="'Target ' + fmtUsd(pipeline.targetLeverageUsd)" outputs="7, 11" />
    </div>

    <div class="grid" style="margin-top:16px; grid-template-columns: 1fr 1fr;">
      <div class="card card-pad">
        <h3 style="margin-bottom:16px">Deliverable health</h3>
        <DonutChart
          :segments="donut"
          :center-value="totals.deliverableCount"
          center-label="outputs"
        />
      </div>
      <div class="card card-pad">
        <h3 style="margin-bottom:16px">County roll-out by offtaker</h3>
        <BarChart :items="countyBars" />
      </div>
    </div>

    <div class="section-title">All funded outputs</div>
    <DeliverableBoard :rows="deliverables" />

    <div class="note" style="margin-top:18px" v-if="role === 'donor'">
      <b>Donor view.</b> This report shows deliverable status and scaling progress against the funded schedule. The quarterly brief adds MEAL, gender and leverage detail.
    </div>
  </div>
</template>

<script setup>
const { totals, deliverables, offtakers, pipeline, programme, fmtUsd, pct } = useProgrammeData()
const { role, roleMeta } = useAuth()

const donut = computed(() => [
  { label: 'On track', value: deliverables.filter((d) => d.rag === 'green').length, color: '#2e7d46' },
  { label: 'At risk', value: deliverables.filter((d) => d.rag === 'amber').length, color: '#c98a1b' },
  { label: 'Scheduled', value: deliverables.filter((d) => d.rag === 'grey').length, color: '#94a3b8' }
])
const countyBars = computed(() => offtakers.map((o) => ({
  label: o.name, value: o.counties.length, display: o.counties.length + ' county',
  color: o.rag === 'red' ? '#c0392b' : o.rag === 'amber' ? '#c98a1b' : '#1f3864'
})))
</script>
