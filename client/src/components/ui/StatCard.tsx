/**
 * StatCard.tsx — Reusable summary card for the Dashboard
 *
 * Displays a single metric with an icon, label, and value.
 * Used for: Total Spent, Total Budget, Remaining, % Used.
 *
 * The `trend` prop optionally shows a coloured sub-label (e.g. "73% used")
 * The `accent` prop controls the icon background colour.
 */

import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  trend?: string
  trendColor?: 'green' | 'amber' | 'red' | 'gray'
  accent?: 'teal' | 'purple' | 'green' | 'red' | 'amber'
  loading?: boolean
}

// Map accent names to Tailwind classes
const accentClasses = {
  teal:   'bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400',
  purple: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
  green:  'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400',
  red:    'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
  amber:  'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
}

const trendColorClasses = {
  green: 'text-green-600 dark:text-green-400',
  amber: 'text-amber-600 dark:text-amber-400',
  red:   'text-red-600 dark:text-red-400',
  gray:  'text-gray-500 dark:text-gray-400',
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendColor = 'gray',
  accent = 'teal',
  loading = false,
}: StatCardProps) {
  // Show a pulsing skeleton while data is loading
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
        <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">

      {/* Icon + label row */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentClasses[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
      </div>

      {/* Main value */}
      <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>

      {/* Optional sub-text */}
      {trend && (
        <p className={`text-xs font-medium mt-1 ${trendColorClasses[trendColor]}`}>{trend}</p>
      )}
    </div>
  )
}
