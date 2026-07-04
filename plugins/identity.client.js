// Initialises Netlify Identity on the client and keeps auth state in sync.
// Safe when Identity is not enabled on the site: the widget simply stays idle
// and the app falls back to preview sign-in.
import netlifyIdentity from 'netlify-identity-widget'

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return
  const { syncIdentity } = useAuth()

  window.netlifyIdentity = netlifyIdentity
  netlifyIdentity.on('init', (user) => syncIdentity(user))
  netlifyIdentity.on('login', (user) => { syncIdentity(user); netlifyIdentity.close() })
  netlifyIdentity.on('logout', () => syncIdentity(null))

  try {
    netlifyIdentity.init({ APIUrl: undefined })
  } catch (e) {
    // Identity not configured for this site; preview mode remains available.
  }
})
