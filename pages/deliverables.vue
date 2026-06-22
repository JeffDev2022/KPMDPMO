<template>
  <div class="page">
    <div class="page-head">
      <div class="eyebrow">Deliverable traceability</div>
      <h1>Funded deliverables</h1>
      <p>Every metric in the dashboard traces back to one of these outputs. Filter by cluster or status to scope the board. The schedule runs from output 1 to output 15 (the funded schedule has no output 9).</p>
    </div>

    <div class="grid grid-4" style="margin-bottom:18px">
      <KpiCard label="Completed" :value="totals.completed" meta="On track or done" />
      <KpiCard label="In progress" :value="totals.started" meta="Currently active" />
      <KpiCard label="Scheduled" :value="totals.scheduled" meta="Future target dates" />
      <KpiCard label="Total outputs" :value="totals.deliverableCount" meta="Funded schedule" />
    </div>

    <div class="card card-pad filters">
      <div>
        <label class="field-label">Cluster</label>
        <select class="select" v-model="cluster">
          <option value="">All clusters</option>
          <option v-for="c in clusters" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div>
        <label class="field-label">Status</label>
        <select class="select" v-model="status">
          <option value="">All statuses</option>
          <option value="Completed">Completed</option>
          <option value="Started">Started</option>
          <option value="Scheduled">Scheduled</option>
        </select>
      </div>
      <div class="result-count">{{ filtered.length }} of {{ deliverables.length }} outputs</div>
    </div>

    <DeliverableBoard :rows="filtered" style="margin-top:16px" />
  </div>
</template>

<script setup>
const { deliverables, totals } = useProgrammeData()
const cluster = ref('')
const status = ref('')
const clusters = computed(() => [...new Set(deliverables.map((d) => d.cluster))])
const filtered = computed(() => deliverables.filter((d) =>
  (!cluster.value || d.cluster === cluster.value) && (!status.value || d.status === status.value)
))
</script>

<style scoped>
.filters { display: grid; grid-template-columns: 1fr 1fr auto; gap: 16px; align-items: end; }
.result-count { font-size: 12.5px; color: var(--ink-3); font-weight: 600; padding-bottom: 10px; }
@media (max-width: 720px) { .filters { grid-template-columns: 1fr; } }
</style>
