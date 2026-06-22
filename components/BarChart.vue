<template>
  <div class="bars">
    <div v-for="(item, i) in items" :key="i" class="bar-row">
      <div class="bar-label">{{ item.label }}</div>
      <div class="bar-track">
        <div class="bar-fill" :style="{ width: pctOf(item.value) + '%', background: item.color || 'var(--navy)' }"></div>
      </div>
      <div class="bar-val">{{ item.display ?? item.value }}</div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({ items: { type: Array, default: () => [] }, max: { type: Number, default: 0 } })
const peak = computed(() => props.max || Math.max(...props.items.map((i) => i.value), 1))
const pctOf = (v) => Math.round((v / peak.value) * 100)
</script>
<style scoped>
.bars { display: flex; flex-direction: column; gap: 13px; }
.bar-row { display: grid; grid-template-columns: 130px 1fr 64px; align-items: center; gap: 12px; }
.bar-label { font-size: 12.5px; color: var(--ink); font-weight: 500; }
.bar-val { font-size: 12.5px; text-align: right; font-weight: 700; color: var(--navy-dk); font-variant-numeric: tabular-nums; }
@media (max-width: 600px) { .bar-row { grid-template-columns: 90px 1fr 54px; } }
</style>
