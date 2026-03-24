import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * vite.config.ts — Vite bundler configuration
 *
 * The server.proxy setting routes any request starting with /api
 * to the NestJS backend, avoiding CORS issues during development.
 *
 * VitePWA registers a service worker and web app manifest so the app
 * can be installed on a phone and work offline (cached assets only —
 * API calls still need a connection).
 */
export default defineConfig({
  plugins: [
    react(),

    // Progressive Web App — makes the app installable on mobile
    VitePWA({
      registerType: 'autoUpdate',   // automatically install new service workers

      // Files to pre-cache when the app first loads
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Don't cache API calls — they must always be live data
        navigateFallbackDenylist: [/^\/api/],
      },

      // Web app manifest — metadata the browser uses for the install prompt
      manifest: {
        name:             'ClearSpend — Student Expense Tracker',
        short_name:       'ClearSpend',
        description:      'Track your spending, set budgets, and stay in control of your student finances.',
        theme_color:      '#14b8a6',   // teal — matches our brand color
        background_color: '#ffffff',
        display:          'standalone', // hides browser chrome when installed
        start_url:        '/',
        scope:            '/',
        icons: [
          {
            src:   '/pwa-192.svg',
            sizes: '192x192',
            type:  'image/svg+xml',
          },
          {
            src:   '/pwa-512.svg',
            sizes: '512x512',
            type:  'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],

  server: {
    host: true,   // listen on 0.0.0.0 so Docker can expose the port
    port: 5173,
    proxy: {
      // Any request to /api/... gets forwarded to the NestJS backend
      '/api': {
        target:      'http://api:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // strip /api prefix
      },
    },
  },
})
