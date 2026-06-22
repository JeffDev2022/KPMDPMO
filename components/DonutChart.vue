<template>
  <div class="donut-wrap">
    <svg viewBox="0 0 42 42" class="donut">
      <circle class="ring-bg" cx="21" cy="21" r="15.915" />
      <circle
        v-for="(seg, i) in computed" :key="i"
        class="ring-seg" cx="21" cy="21" r="15.915"
        :stroke="seg.color" :stroke-dasharray="`${seg.pct} ${100 - seg.pct}`"
        :stroke-dashoffset="seg.offset"
      />
      <text x="21" y="20.5" class="d-num">{{ centerValue }}</text>
      <text x="21" y="25.5" class="d-lbl">{{ centerLabel }}</text>
    </svg>
    <div class="legend">
      <div v-for="(seg, i) in segments" :key="i" class="leg">
        <span class="leg-dot" :style="{ background: seg.color }"></span>
        <span class="leg-lbl">{{ seg.label }}</span>
        <span class="leg-val">{{ seg.value }}</span>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({ segments: { type: Array, default: () => [] }, centerValue: [String, Number], centerLabel: String })
const total = computed(() => props.segments.reduce((s, x) => s + x.value, 0) || 1)
const computed = computed(() => {
  let acc = 0
  return props.segments.map((s) => {
    const pct = (s.value / total.value) * 100
    const seg = { color: s.color, pct, offset: 25 - acc }
    acc += pct
    return seg
  })
})
</script>
<style scoped>
.donut-wrap { display: flex; align-items: center; gap: 22px; }
.donut { width: 132px; height: 132px; transform: rotate(0deg); }
.ring-bg { fill: none; stroke: #eef1f5; stroke-width: 4.2; }
.ring-seg { fill: none; stroke-width: 4.2; stroke-linecap: butt; transition: stroke-dasharray 0.4s; }
.d-num { font-size: 8px; font-weight: 800; fill: var(--navy-dk); text-anchor: middle; }
.d-lbl { font-size: 2.6px; font-weight: 600; fill: var(--ink-3); text-anchor: middle; text-transform: uppercase; letter-spacing: 0.1px; }
.legend { display: flex; flex-direction: column; gap: 9px; }
.leg { display: grid; grid-template-columns: 12px 1fr auto; align-items: center; gap: 9px; font-size: 12.5px; }
.leg-dot { width: 10px; height: 10px; border-radius: 3px; }
.leg-lbl { color: var(--ink-2); }
.leg-val { font-weight: 700; color: var(--navy-dk); }
</style>
