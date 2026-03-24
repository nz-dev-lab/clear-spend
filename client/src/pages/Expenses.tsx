/**
 * Expenses.tsx — Expense log page (Step 11)
 * Placeholder until Step 11.
 */
import { useOutletContext } from 'react-router-dom'

export default function Expenses() {
  const { month } = useOutletContext<{ month: string }>()
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 dark:text-gray-500">Expenses coming in Step 11 — {month}</p>
    </div>
  )
}
