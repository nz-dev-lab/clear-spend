/**
 * Header.tsx — Top bar shown inside the main content area
 *
 * Contains:
 *   - Page title (passed as a prop)
 *   - Month picker (prev/next arrows + current month display)
 *   - Dark/light mode toggle (Sun / Moon icon)
 *   - User avatar with first initial
 *
 * The month picker controls which month's data is shown across all pages.
 * It's lifted up to AppLayout so all pages share the same selected month.
 */

import { ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

interface HeaderProps {
  title: string
  month: string                      // "YYYY-MM"
  onMonthChange: (m: string) => void
  userName?: string
}

/** Format "2026-03" → "March 2026" for display */
function formatMonth(month: string): string {
  const [year, mon] = month.split('-').map(Number)
  return new Date(year, mon - 1).toLocaleDateString('en-NZ', {
    month: 'long',
    year: 'numeric',
  })
}

/** Short version for narrow mobile screens — "Mar 2026" */
function formatMonthShort(month: string): string {
  const [year, mon] = month.split('-').map(Number)
  return new Date(year, mon - 1).toLocaleDateString('en-NZ', {
    month: 'short',
    year: 'numeric',
  })
}

/** Move the month forward or backward by one */
function shiftMonth(month: string, direction: 1 | -1): string {
  const [year, mon] = month.split('-').map(Number)
  const date = new Date(year, mon - 1 + direction)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export default function Header({ title, month, onMonthChange, userName }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex items-center justify-between px-4 py-4 lg:px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">

      {/* Page title — truncated with ellipsis if the right-side controls take too much space */}
      <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate flex-1 mr-2">{title}</h1>

      <div className="flex items-center gap-2">

        {/* Month picker */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-2 py-1">
          <button
            onClick={() => onMonthChange(shiftMonth(month, -1))}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Short format on mobile (e.g. "Mar 2026"), full on desktop ("March 2026") */}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[68px] sm:min-w-[110px] text-center">
            <span className="sm:hidden">{formatMonthShort(month)}</span>
            <span className="hidden sm:inline">{formatMonth(month)}</span>
          </span>

          <button
            onClick={() => onMonthChange(shiftMonth(month, 1))}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Dark/light mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun  className="w-4 h-4 text-amber-400" />
            : <Moon className="w-4 h-4 text-gray-600"  />
          }
        </button>

        {/* User avatar — shows first initial of their name */}
        {userName && (
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
