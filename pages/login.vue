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
      Team members sign in with their programme account. The account role sets the lens:
      programme staff land on the operational view, the donor and governance audience on the
      accountability view.
    </p>

    <button class="enter" @click="signIn">Sign in</button>

    <div class="divider"><span>or preview without signing in</span></div>

    <div class="roles">
      <button
        v-for="r in roleList" :key="r.id"
        class="role" :class="{ sel: selected === r.id }"
        @click="selected = r.id"
      >
        <div class="role-top">
          <span class="role-name">{{ r.label }}</span>
          <span class="role-check" v-if="selected === r.id">&#10003;</span>
        </div>
        <div class="role-lens">{{ r.lens }}</div>
      </button>
    </div>
    <button class="preview" @click="enterPreview">Preview as {{ selectedLabel }}</button>

    <div class="lc-foot">
      <span>Investment INV 093207</span>
      <span>Preview is read-only. Uploads and stored reports require a signed-in account.</span>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'auth' })
const { login, openIdentity, isAuthed, roleMeta, ROLES } = useAuth()
const roleList = Object.values(ROLES)
const selected = ref('staff')
const selectedLabel = computed(() => ROLES[selected.value].label)

const signIn = () => openIdentity()
const enterPreview = () => navigateTo(login(selected.value))

// If Identity login completes, move on to the role landing page.
watch(isAuthed, (v) => { if (v && roleMeta.value) navigateTo(roleMeta.value.landing) })
</script>

<style scoped>
.login-card { width: 100%; max-width: 480px; background: #fff; border-radius: 18px; padding: 32px 30px; box-shadow: 0 30px 60px rgba(0,0,0,0.3); }
.lc-head { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.logo { width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0; background: linear-gradient(135deg, #c9a227, #a67c00); color: #14213d; font-weight: 800; font-size: 18px; display: flex; align-items: center; justify-content: center; }
.lc-title { font-size: 18px; font-weight: 800; color: var(--navy-dk); }
.lc-sub { font-size: 12px; color: var(--ink-3); margin-top: 2px; }
.lc-intro { font-size: 13px; color: var(--ink-2); line-height: 1.55; margin: 0 0 18px; }
.enter { width: 100%; cursor: pointer; border: none; border-radius: 11px; padding: 13px; background: var(--navy); color: #fff; font-weight: 700; font-size: 14px; font-family: inherit; transition: background 0.12s; }
.enter:hover { background: var(--navy-dk); }
.divider { display: flex; align-items: center; text-align: center; margin: 20px 0 16px; color: var(--ink-3); font-size: 11.5px; }
.divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid var(--border); }
.divider span { padding: 0 12px; }
.roles { display: flex; gap: 8px; margin-bottom: 12px; }
.role { flex: 1; text-align: left; cursor: pointer; border: 1.5px solid var(--border); border-radius: 12px; padding: 11px 12px; background: #fff; font-family: inherit; transition: all 0.12s; }
.role:hover { border-color: var(--navy-700); }
.role.sel { border-color: var(--gold); background: var(--gold-soft); }
.role-top { display: flex; align-items: center; justify-content: space-between; }
.role-name { font-weight: 700; font-size: 12.5px; color: var(--navy-dk); }
.role-check { color: var(--gold); font-weight: 800; }
.role-lens { font-size: 11px; color: var(--gold); font-weight: 600; margin-top: 2px; }
.preview { width: 100%; cursor: pointer; border: 1px solid var(--border-dk); border-radius: 11px; padding: 11px; background: #fff; color: var(--ink); font-weight: 600; font-size: 13px; font-family: inherit; }
.preview:hover { border-color: var(--navy); color: var(--navy); }
.lc-foot { display: flex; flex-direction: column; gap: 3px; margin-top: 16px; font-size: 11px; color: var(--ink-3); text-align: center; }
</style>
