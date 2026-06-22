<template>
  <div class="shell">
    <AppSidebar />
    <div class="main">
      <AppTopbar />
      <div class="content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
// default layout: persistent sidebar + topbar around routed content
</script>

<style scoped>
.shell { display: flex; min-height: 100vh; }
.main { flex: 1; min-width: 0; display: flex; flex-direction: column; margin-left: var(--sidebar-w); }
.content { flex: 1; }
@media (max-width: 880px) {
  .main { margin-left: 0; }
}
</style>
