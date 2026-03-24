/**
 * PageLoader.tsx — Full-page loading spinner
 *
 * Used as the Suspense fallback while a lazy-loaded page chunk
 * is being downloaded. Keeps the layout stable (same height as
 * the main content area) so there's no jarring shift when the
 * page appears.
 */

import { Loader2 } from 'lucide-react'

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      {/* Spinning teal ring — Tailwind's animate-spin handles the rotation */}
      <Loader2 className="w-9 h-9 text-primary-500 animate-spin" strokeWidth={2} />
      <p className="text-sm text-gray-400 dark:text-gray-500">Loading…</p>
    </div>
  )
}
