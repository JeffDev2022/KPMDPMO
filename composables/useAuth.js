// ---------------------------------------------------------------------------
// Authentication and role state.
//
// For the demonstration build this is a lightweight client side store persisted
// to localStorage. In production it is replaced by Netlify Identity: the role is
// read from the identity Roles field (the same pattern used on the live
// programme sites), and the login screen is replaced by the Identity widget.
// The rest of the application depends only on `role`, so the swap is contained.
// ---------------------------------------------------------------------------

const state = reactive({
  user: null,        // { name, role }
  ready: false
})

export const ROLES = {
  staff: {
    id: 'staff',
    label: 'Programme staff',
    lens: 'Operational lens',
    landing: '/daily',
    nav: ['daily', 'weekly', 'monthly', 'deliverables', 'offtakers', 'pipeline', 'reports']
  },
  donor: {
    id: 'donor',
    label: 'Donor and governance',
    lens: 'Accountability lens',
    landing: '/quarterly',
    nav: ['quarterly', 'yearly', 'monthly', 'deliverables', 'pipeline', 'reports']
  },
  admin: {
    id: 'admin',
    label: 'Administrator',
    lens: 'Full access',
    landing: '/monthly',
    nav: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'deliverables', 'offtakers', 'pipeline', 'reports']
  }
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

  const login = (role, name) => {
    const r = ROLES[role] ? role : 'staff'
    state.user = { role: r, name: name || ROLES[r].label }
    if (import.meta.client) localStorage.setItem('kpmd_user', JSON.stringify(state.user))
    return ROLES[r].landing
  }

  const logout = () => {
    state.user = null
    if (import.meta.client) localStorage.removeItem('kpmd_user')
  }

  const role = computed(() => state.user?.role || null)
  const roleMeta = computed(() => (role.value ? ROLES[role.value] : null))
  const isAuthed = computed(() => !!state.user)
  const can = (key) => !!roleMeta.value && roleMeta.value.nav.includes(key)

  return { user: toRef(state, 'user'), role, roleMeta, isAuthed, login, logout, can, ROLES }
}
