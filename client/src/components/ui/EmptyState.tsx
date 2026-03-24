/**
 * EmptyState.tsx — Friendly empty state when there's no data yet
 *
 * Shown when the user hasn't logged any expenses yet for the selected month.
 * Includes a call-to-action button so they know what to do next.
 */

import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon in a soft teal circle */}
      <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primary-500" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{description}</p>

      {/* Optional CTA button */}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
