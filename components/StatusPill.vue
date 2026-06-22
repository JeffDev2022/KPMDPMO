<template>
  <span class="pill" :class="rag"><span class="dot"></span>{{ label || fallback }}</span>
</template>
<script setup>
const props = defineProps({ rag: { type: String, default: 'grey' }, label: { type: String, default: '' } })
const map = { green: 'On track', amber: 'At risk', red: 'Off track', grey: 'Scheduled' }
const fallback = computed(() => map[props.rag] || 'Scheduled')
</script>
