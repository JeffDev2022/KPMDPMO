<template>
  <header class="topbar">
    <div class="left">
      <div class="t-title">{{ programme.short }} Programme</div>
      <div class="t-sub">{{ programme.name }}</div>
    </div>

    <div class="right">
      <DataFreshness />
      <div class="user" @click="open = !open">
        <div class="avatar">{{ initials }}</div>
        <div class="u-meta">
          <div class="u-name">{{ user?.name }}</div>
          <div class="u-role">{{ roleMeta?.label }}</div>
        </div>
        <span class="chev">▾</span>
        <div v-if="open" class="menu" @click.stop>
          <div class="menu-head">{{ roleMeta?.label }}</div>
          <button class="menu-item" @click="switchRole">Switch role</button>
          <button class="menu-item danger" @click="signOut">Sign out</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { programme } from '~/data/seed.js'
const { user, roleMeta, logout } = useAuth()
const open = ref(false)

const initials = computed(() => {
  const n = user.value?.name || 'U'
  return n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
})
const signOut = () => { logout(); navigateTo('/login') }
const switchRole = () => { logout(); navigateTo('/login') }

if (import.meta.client) {
  window.addEventListener('click', () => { open.value = false })
}
</script>

<style scoped>
.topbar {
  position: sticky; top: 0; z-index: 20; height: 64px;
  background: rgba(255,255,255,0.92); backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between; padding: 0 30px;
}
.t-title { font-weight: 700; font-size: 15px; color: var(--navy-dk); }
.t-sub { font-size: 11.5px; color: var(--ink-3); }
.right { display: flex; align-items: center; gap: 18px; }
.user { display: flex; align-items: center; gap: 10px; cursor: pointer; position: relative; padding: 6px 8px; border-radius: 10px; }
.user:hover { background: var(--grey-soft); }
.avatar {
  width: 34px; height: 34px; border-radius: 9px; background: var(--navy); color: #fff;
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;
}
.u-name { font-size: 13px; font-weight: 600; color: var(--ink); line-height: 1.2; }
.u-role { font-size: 11px; color: var(--ink-3); }
.chev { color: var(--ink-3); font-size: 11px; }
.menu {
  position: absolute; top: 50px; right: 0; background: #fff; border: 1px solid var(--border);
  border-radius: 10px; box-shadow: var(--shadow-md); min-width: 170px; padding: 6px; z-index: 40;
}
.menu-head { font-size: 11px; color: var(--ink-3); padding: 6px 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
.menu-item { display: block; width: 100%; text-align: left; background: none; border: none; cursor: pointer; padding: 8px 10px; border-radius: 7px; font-size: 13px; font-family: inherit; color: var(--ink); }
.menu-item:hover { background: var(--grey-soft); }
.menu-item.danger { color: var(--red); }
@media (max-width: 720px) { .u-meta { display: none; } .t-sub { display: none; } }
</style>
