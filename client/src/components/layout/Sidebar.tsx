/**
 * Sidebar.tsx — Desktop left navigation (visible on lg+ screens)
 *
 * Shows the app logo, nav links with Lucide icons, and a logout button.
 * Hidden on mobile — mobile users get the BottomNav instead.
 * Active route gets a teal highlight.
 */

import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  Tag,
  LogOut,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { logout } from '../../api/auth'

// Navigation items — each maps to a page
const navItems = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/expenses',   icon: Receipt,         label: 'Expenses'   },
  { to: '/budgets',    icon: PiggyBank,       label: 'Budgets'    },
  { to: '/reports',    icon: BarChart3,       label: 'Reports'    },
  { to: '/categories', icon: Tag,             label: 'Categories' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      localStorage.removeItem('accessToken')
      navigate('/login')
    } catch {
      // Even if the server call fails, clear local state and redirect
      localStorage.removeItem('accessToken')
      navigate('/login')
    }
  }

  return (
    // Hidden on small screens, shown as a fixed column on large screens
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">

      {/* App logo / brand */}
      <div className="flex items-center gap-2 px-6 py-6 border-b border-gray-200 dark:border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg text-gray-900 dark:text-white">ClearSpend</span>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'} // exact match for dashboard only
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout at the bottom */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </aside>
  )
}
