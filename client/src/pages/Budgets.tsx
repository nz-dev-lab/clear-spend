/**
 * Budgets.tsx — Budget management page (Step 12)
 * Placeholder until Step 12.
 */
import { useOutletContext } from 'react-router-dom'

export default function Budgets() {
  const { month } = useOutletContext<{ month: string }>()
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 dark:text-gray-500">Budgets coming in Step 12 — {month}</p>
    </div>
  )
}
