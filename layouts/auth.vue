<template>
  <div class="auth-shell">
    <slot />
  </div>
</template>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(1200px 600px at 20% -10%, rgba(166, 124, 0, 0.18), transparent 60%),
    linear-gradient(135deg, #14213d 0%, #1f3864 60%, #25416f 100%);
  padding: 24px;
}
</style>
