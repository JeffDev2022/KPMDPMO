<template>
  <div class="page"><p class="muted">Loading your dashboard…</p></div>
</template>
<script setup>
// Middleware routes authenticated users to their role landing page.
const { roleMeta, isAuthed } = useAuth()
onMounted(() => {
  navigateTo(isAuthed.value ? roleMeta.value.landing : '/login')
})
</script>
