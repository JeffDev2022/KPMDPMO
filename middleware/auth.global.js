// Global guard: unauthenticated users go to the login screen; authenticated
// users hitting the root or login are sent to their role landing page.
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const { isAuthed, roleMeta } = useAuth()

  if (to.path === '/login') {
    if (isAuthed.value) return navigateTo(roleMeta.value.landing)
    return
  }
  if (!isAuthed.value) return navigateTo('/login')
  if (to.path === '/') return navigateTo(roleMeta.value.landing)
})
