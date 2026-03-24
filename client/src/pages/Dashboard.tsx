/**
 * Dashboard.tsx — Home screen (Step 10)
 * Placeholder until Step 10 — summary cards + charts go here.
 */
import { useOutletContext } from 'react-router-dom'

export default function Dashboard() {
  const { month } = useOutletContext<{ month: string }>()
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 dark:text-gray-500">Dashboard coming in Step 10 — {month}</p>
    </div>
  )
}
