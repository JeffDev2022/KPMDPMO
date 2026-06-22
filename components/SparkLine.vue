<template>
  <svg :viewBox="`0 0 ${w} ${h}`" class="spark" preserveAspectRatio="none">
    <polyline :points="area" :fill="`var(--${tone}-soft, #eef1f5)`" stroke="none" opacity="0.5" />
    <polyline :points="line" fill="none" :stroke="stroke" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
    <circle :cx="lastX" :cy="lastY" r="2.6" :fill="stroke" />
  </svg>
</template>
<script setup>
const props = defineProps({
  data: { type: Array, default: () => [] },
  tone: { type: String, default: 'green' },
  w: { type: Number, default: 120 }, h: { type: Number, default: 34 }
})
const toneColor = { green: '#2e7d46', red: '#c0392b', navy: '#1f3864', gold: '#a67c00' }
const stroke = computed(() => toneColor[props.tone] || '#1f3864')
const pts = computed(() => {
  const d = props.data.length ? props.data : [0, 0]
  const min = Math.min(...d), max = Math.max(...d), range = max - min || 1
  const step = props.w / (d.length - 1 || 1)
  return d.map((v, i) => [i * step, props.h - 4 - ((v - min) / range) * (props.h - 8)])
})
const line = computed(() => pts.value.map((p) => p.join(',')).join(' '))
const area = computed(() => `0,${props.h} ${line.value} ${props.w},${props.h}`)
const lastX = computed(() => pts.value[pts.value.length - 1][0])
const lastY = computed(() => pts.value[pts.value.length - 1][1])
</script>
<style scoped>.spark { width: 100%; height: 34px; display: block; }</style>
