// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // SPA mode. The dashboard is a client side application served from Netlify,
  // matching the existing programme deployment pattern. SSR is not needed because
  // every view is gated behind authentication and reads a live data layer.
  ssr: false,

  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'KPMD Programme Dashboard',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'KPMD / MTLDK Programme Dashboard. Strathmore University Business School.' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' }
      ]
    }
  },

  // Keep the heavy export libraries out of the optimiser so they load on demand.
  vite: {
    optimizeDeps: {
      exclude: ['docx', 'pptxgenjs', 'jspdf', 'jspdf-autotable', 'xlsx']
    }
  },

  nitro: {
    // On Netlify the preset is auto detected. Static keeps a clean SPA output locally.
    prerender: { crawlLinks: false, routes: [] }
  }
})
