<template>
  <div class="fresh" :title="detail">
    <span class="dot" :class="overall"></span>
    <span class="txt">Data {{ overall === 'fresh' ? 'current' : 'aging' }}</span>
    <span class="time">· updated {{ latest }}</span>
  </div>
</template>

<script setup>
import { sources } from '~/data/seed.js'
const overall = computed(() => sources.some((s) => s.status !== 'fresh') ? 'aging' : 'fresh')
const latest = computed(() => {
  const d = new Date(Math.max(...sources.map((s) => new Date(s.updated).getTime())))
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
})
const detail = computed(() => sources.map((s) => `${s.label}: ${s.status}`).join('\n'))
</script>

<style scoped>
.fresh { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--ink-2); }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.fresh { background: var(--green); box-shadow: 0 0 0 3px var(--green-soft); }
.dot.aging { background: var(--amber); box-shadow: 0 0 0 3px var(--amber-soft); }
.txt { font-weight: 600; }
.time { color: var(--ink-3); }
@media (max-width: 720px) { .time { display: none; } }
</style>
