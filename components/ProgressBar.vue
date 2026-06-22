<template>
  <div class="pb">
    <div class="bar-track"><div class="bar-fill" :style="{ width: clamped + '%', background: color }"></div></div>
    <span v-if="showVal" class="pb-val">{{ clamped }}%</span>
  </div>
</template>
<script setup>
const props = defineProps({ value: { type: Number, default: 0 }, rag: { type: String, default: '' }, showVal: { type: Boolean, default: true } })
const clamped = computed(() => Math.max(0, Math.min(100, Math.round(props.value))))
const ragColor = { green: 'var(--green)', amber: 'var(--amber)', red: 'var(--red)', grey: 'var(--grey)' }
const color = computed(() => ragColor[props.rag] || 'var(--navy)')
</script>
<style scoped>
.pb { display: flex; align-items: center; gap: 10px; }
.pb .bar-track { flex: 1; }
.pb-val { font-size: 11.5px; font-weight: 700; color: var(--ink-2); width: 34px; text-align: right; font-variant-numeric: tabular-nums; }
</style>
