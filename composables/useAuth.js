// ---------------------------------------------------------------------------
// Authentication and role state.
//
// Two sign-in paths:
//  - Netlify Identity (real): team members sign in, the JWT is attached to
//    function calls, and the serverless functions verify it. Role comes from
//    the Identity user's app_metadata.roles.
//  - Preview (fallback): a local role selector for viewing the dashboard when
//    Identity is not enabled. Preview users have no token, so the Drive-backed
//    functions stay locked and the Reporting Hub shows demo data.
// ---------------------------------------------------------------------------

const state = reactive({
  user: null,        // { name, role, source: 'identity' | 'preview', email? }
  ready: false
})

export const ROLES = {
  staff: {
    id: 'staff', label: 'Programme staff', lens: 'Operational lens', landing: '/daily',
    nav: ['daily', 'weekly', 'monthly', 'deliverables', 'offtakers', 'pipeline', 'hub', 'consolidate', 'reports']
  },
  donor: {
    id: 'donor', label: 'Donor and governance', lens: 'Accountability lens', landing: '/quarterly',
    nav: ['quarterly', 'yearly', 'monthly', 'deliverables', 'pipeline', 'reports']
  },
  admin: {
    id: 'admin', label: 'Administrator', lens: 'Full access', landing: '/monthly',
    nav: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'deliverables', 'offtakers', 'pipeline', 'hub', 'consolidate', 'reports']
  }
}

function roleFromIdentity(user) {
  const roles = user?.app_metadata?.roles || []
  if (roles.includes('admin')) return 'admin'
  if (roles.includes('donor')) return 'donor'
  return 'staff'
}

export function useAuth() {
  const restore = () => {
    if (state.ready) return
    if (import.meta.client) {
      try {
        const raw = localStorage.getItem('kpmd_user')
        if (raw) state.user = JSON.parse(raw)
      } catch (e) { state.user = null }
    }
    state.ready = true
  }
  restore()

  // Called by the Identity plugin on init / login / logout.
  const syncIdentity = (identityUser) => {
    if (identityUser) {
      state.user = {
        name: identityUser.user_metadata?.full_name || identityUser.email,
        email: identityUser.email,
        role: roleFromIdentity(identityUser),
        source: 'identity'
      }
    } else if (state.user?.source === 'identity') {
      state.user = null
    }
  }

  // Preview sign-in (no token).
  const login = (role, name) => {
    const r = ROLES[role] ? role : 'staff'
    state.user = { role: r, name: name || ROLES[r].label, source: 'preview' }
    if (import.meta.client) localStorage.setItem('kpmd_user', JSON.stringify(state.user))
    return ROLES[r].landing
  }

  const openIdentity = () => { if (import.meta.client && window.netlifyIdentity) window.netlifyIdentity.open('login') }
  const identityAvailable = () => import.meta.client && !!window.netlifyIdentity

  const logout = () => {
    if (import.meta.client) {
      localStorage.removeItem('kpmd_user')
      if (state.user?.source === 'identity' && window.netlifyIdentity) window.netlifyIdentity.logout()
    }
    state.user = null
  }

  // Fresh JWT for authorising function calls (identity only).
  const getToken = async () => {
    if (!import.meta.client || !window.netlifyIdentity) return null
    const u = window.netlifyIdentity.currentUser()
    if (!u) return null
    try { return await u.jwt() } catch { return null }
  }

  const role = computed(() => state.user?.role || null)
  const roleMeta = computed(() => (role.value ? ROLES[role.value] : null))
  const isAuthed = computed(() => !!state.user)
  const can = (key) => !!roleMeta.value && roleMeta.value.nav.includes(key)

  return {
    user: toRef(state, 'user'), role, roleMeta, isAuthed,
    login, logout, can, syncIdentity, openIdentity, identityAvailable, getToken, ROLES
  }
}
