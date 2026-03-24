import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // needed for Docker — listens on 0.0.0.0 not just localhost
    port: 5173,
  },
})
