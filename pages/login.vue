<template>
  <div class="login-card">
    <div class="lc-head">
      <div class="logo">SU</div>
      <div>
        <div class="lc-title">KPMD Programme Dashboard</div>
        <div class="lc-sub">Markets-Based Transformation for Livestock Development in Kenya</div>
      </div>
    </div>

    <p class="lc-intro">
      One instrument, two lenses. Choose how you are signing in. Programme staff land on the
      operational view, the donor and governance audience land on the accountability view.
    </p>

    <div class="roles">
      <button
        v-for="r in roleList" :key="r.id"
        class="role" :class="{ sel: selected === r.id }"
        @click="selected = r.id"
      >
        <div class="role-top">
          <span class="role-name">{{ r.label }}</span>
          <span class="role-check" v-if="selected === r.id">✓</span>
        </div>
        <div class="role-lens">{{ r.lens }}</div>
        <div class="role-land">Lands on {{ r.landing.replace('/', '') }}</div>
      </button>
    </div>

    <button class="enter" @click="enter">Enter dashboard</button>

    <div class="lc-foot">
      <span>Investment INV 093207</span>
      <span>Demo access. In production this screen is replaced by Netlify Identity.</span>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'auth' })
const { login, ROLES } = useAuth()
const roleList = Object.values(ROLES)
const selected = ref('staff')
const enter = () => {
  const landing = login(selected.value)
  navigateTo(landing)
}
</script>

<style scoped>
.login-card {
  width: 100%; max-width: 480px; background: #fff; border-radius: 18px;
  padding: 32px 30px; box-shadow: 0 30px 60px rgba(0,0,0,0.3);
}
.lc-head { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.logo {
  width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(135deg, #c9a227, #a67c00); color: #14213d;
  font-weight: 800; font-size: 18px; display: flex; align-items: center; justify-content: center;
}
.lc-title { font-size: 18px; font-weight: 800; color: var(--navy-dk); }
.lc-sub { font-size: 12px; color: var(--ink-3); margin-top: 2px; }
.lc-intro { font-size: 13px; color: var(--ink-2); line-height: 1.55; margin: 0 0 18px; }
.roles { display: flex; flex-direction: column; gap: 10px; margin-bottom: 22px; }
.role {
  text-align: left; cursor: pointer; border: 1.5px solid var(--border); border-radius: 12px;
  padding: 13px 15px; background: #fff; font-family: inherit; transition: all 0.12s;
}
.role:hover { border-color: var(--navy-700); }
.role.sel { border-color: var(--gold); background: var(--gold-soft); }
.role-top { display: flex; align-items: center; justify-content: space-between; }
.role-name { font-weight: 700; font-size: 14px; color: var(--navy-dk); }
.role-check { color: var(--gold); font-weight: 800; }
.role-lens { font-size: 12px; color: var(--gold); font-weight: 600; margin-top: 2px; }
.role-land { font-size: 11.5px; color: var(--ink-3); margin-top: 3px; text-transform: capitalize; }
.enter {
  width: 100%; cursor: pointer; border: none; border-radius: 11px; padding: 13px;
  background: var(--navy); color: #fff; font-weight: 700; font-size: 14px; font-family: inherit;
  transition: background 0.12s;
}
.enter:hover { background: var(--navy-dk); }
.lc-foot { display: flex; flex-direction: column; gap: 3px; margin-top: 16px; font-size: 11px; color: var(--ink-3); text-align: center; }
</style>
