import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * vite.config.ts — Vite bundler configuration
 *
 * The server.proxy setting routes any request starting with /api
 * to the NestJS backend, avoiding CORS issues during development.
 * The browser always talks to localhost:5173, Vite forwards to the API.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // listen on 0.0.0.0 so Docker can expose the port
    port: 5173,
    proxy: {
      // Any request to /api/... gets forwarded to the NestJS backend
      '/api': {
        target: 'http://api:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // strip /api prefix
      },
    },
  },
})
