<template>
  <div class="card">
    <div class="card-head">
      <h3>Deliverable status board</h3>
      <span class="sub">{{ rows.length }} funded outputs · RAG against target date</span>
    </div>
    <div class="tbl-scroll">
      <table class="data">
        <thead>
          <tr>
            <th style="width:48px">No.</th>
            <th>Output</th>
            <th>Cluster</th>
            <th style="width:108px">Target</th>
            <th style="width:150px">Progress</th>
            <th style="width:120px">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in rows" :key="d.id">
            <td class="strong">{{ d.id }}</td>
            <td>
              <div class="strong">{{ d.title }}</div>
              <div class="muted small">{{ d.comment }}</div>
            </td>
            <td class="muted">{{ d.cluster }}</td>
            <td>{{ fmtDate(d.target) }}</td>
            <td><ProgressBar :value="d.progress" :rag="d.rag" /></td>
            <td><StatusPill :rag="d.rag" :label="`${d.status}`" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ rows: { type: Array, default: () => [] } })
const fmtDate = (s) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
</script>

<style scoped>
.tbl-scroll { overflow-x: auto; }
.small { font-size: 11.5px; margin-top: 2px; max-width: 420px; }
</style>
