<template>
  <div class="card kpi">
    <div class="label">{{ label }}</div>
    <div class="value">{{ value }}</div>
    <div class="flex between center">
      <div class="meta" :class="trend">
        <span v-if="trend==='up'">▲</span><span v-else-if="trend==='down'">▼</span>
        <span>{{ meta }}</span>
      </div>
      <div v-if="outputs" class="ref">OUTPUT {{ outputs }}</div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  label: String, value: [String, Number], meta: String,
  trend: { type: String, default: '' }, outputs: { type: String, default: '' }
})
</script>
