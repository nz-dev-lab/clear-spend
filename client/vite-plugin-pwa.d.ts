// Local type stub for vite-plugin-pwa.
// The real package is installed inside the Docker container.
// This stub exists only so the IDE doesn't show a missing-module error.
declare module 'vite-plugin-pwa' {
  import type { Plugin } from 'vite'
  export function VitePWA(options?: Record<string, any>): Plugin
}
