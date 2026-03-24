/**
 * AppLayout.tsx — Main layout wrapper for all authenticated pages
 *
 * Provides the two-column structure:
 *   - LEFT:  Sidebar (desktop only — hidden on mobile)
 *   - RIGHT: Header + scrollable page content
 *
 * Also renders the BottomNav fixed to the bottom on mobile.
 *
 * The selected month is stored here and passed down to the Header.
 * Pages that need the month (Dashboard, Expenses, etc.) read it via the
 * outlet context so they're all in sync with the header's month picker.
 */

import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import Header from './Header'
import api from '../../api/axios'
import { useQuery } from '@tanstack/react-query'
import type { User } from '../../types'

// Map route paths to page titles shown in the header
const PAGE_TITLES: Record<string, string> = {
  '/':           'Dashboard',
  '/expenses':   'Expenses',
  '/budgets':    'Budgets',
  '/reports':    'Reports',
  '/categories': 'Categories',
}

/** Get the current month as "YYYY-MM" string */
function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export default function AppLayout() {
  const location = useLocation()
  const [month, setMonth] = useState(currentMonth)

  // Fetch current user's name for the avatar in the header
  const { data: user } = useQuery<User>({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/users/me')
      return data
    },
  })

  const title = PAGE_TITLES[location.pathname] ?? 'ClearSpend'

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Desktop sidebar — hidden on mobile via CSS */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top header with month picker and theme toggle */}
        <Header
          title={title}
          month={month}
          onMonthChange={setMonth}
          userName={user?.name}
        />

        {/* Page content — overflow-x hidden prevents any child causing horizontal scroll */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 pb-28 lg:pb-6">
          <Outlet context={{ month }} />
        </main>
      </div>

      {/* Mobile bottom nav — hidden on desktop via CSS */}
      <BottomNav />
    </div>
  )
}
