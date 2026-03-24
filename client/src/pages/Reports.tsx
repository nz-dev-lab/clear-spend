/**
 * Reports.tsx — Reports + CSV export page (Step 14)
 * Placeholder until Step 14.
 */
import { useOutletContext } from 'react-router-dom'

export default function Reports() {
  const { month } = useOutletContext<{ month: string }>()
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 dark:text-gray-500">Reports coming in Step 14 — {month}</p>
    </div>
  )
}
