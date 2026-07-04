<template>
  <div class="cell">
    <span class="pill" :class="cell.status === 'received' ? 'green' : 'red'">
      <span class="dot"></span>{{ cell.status === 'received' ? 'Received' : 'Not in' }}
    </span>
    <a v-if="cell.file && cell.file.link && cell.file.link !== '#demo'" :href="cell.file.link" target="_blank" class="cl-link">Open ↗</a>
    <button v-else-if="cell.status === 'missing'" class="cl-remind" @click="remind">Remind</button>
  </div>
</template>

<script setup>
const props = defineProps({
  cell: { type: Object, required: true },
  offtaker: { type: String, default: '' },
  type: { type: String, default: '' }
})
const remind = () => {
  const subject = encodeURIComponent(`KPMD ${props.type} report outstanding`)
  const body = encodeURIComponent(`Dear ${props.offtaker} team,\n\nWe have not yet received your ${props.type} report for the current period. Kindly submit at your earliest convenience.\n\nThank you,\nKPMD Programme Management Office`)
  if (import.meta.client) window.location.href = `mailto:?subject=${subject}&body=${body}`
}
</script>

<style scoped>
.cell { display: flex; align-items: center; gap: 10px; }
.cl-link { font-size: 11.5px; font-weight: 600; color: var(--navy); }
.cl-remind {
  font-size: 11.5px; font-weight: 600; color: var(--gold); background: none; border: none;
  cursor: pointer; font-family: inherit; padding: 0;
}
.cl-remind:hover { text-decoration: underline; }
</style>
