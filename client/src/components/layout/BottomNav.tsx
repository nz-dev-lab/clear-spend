/**
 * BottomNav.tsx — Mobile bottom tab bar (visible on small screens only)
 *
 * Fixed to the bottom of the screen on mobile — just like the Monzo app.
 * Hidden on lg+ screens where the Sidebar is shown instead.
 * Active tab gets a teal icon and label.
 */

import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, PiggyBank, BarChart3, Tag } from 'lucide-react'

const navItems = [
  { to: '/',           icon: LayoutDashboard, label: 'Home'       },
  { to: '/expenses',   icon: Receipt,         label: 'Expenses'   },
  { to: '/budgets',    icon: PiggyBank,       label: 'Budgets'    },
  { to: '/reports',    icon: BarChart3,       label: 'Reports'    },
  { to: '/categories', icon: Tag,             label: 'Categories' },
]

export default function BottomNav() {
  return (
    // Visible only on small/medium screens — hidden from lg upward
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
