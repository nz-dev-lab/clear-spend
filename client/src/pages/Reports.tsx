/**
 * Reports.tsx — Spending reports + CSV export
 *
 * Shows deeper analytics for the selected month:
 *   1. Budget vs Actual bar chart — green bar (budget) vs teal bar (spent)
 *   2. Category breakdown table — each category with % of total spend
 *   3. CSV export — downloads all expenses for the month as a .csv file
 *
 * Data comes from the same analytics endpoints used on the Dashboard,
 * but visualised differently here for a "report" style view.
 */

import { useOutletContext } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts'
import { Download, BarChart2, PieChart } from 'lucide-react'

import { getBudgetVsActual, getSpendByCategory } from '../api/analytics'
import { getExpenses } from '../api/expenses'
import CategoryIcon from '../components/ui/CategoryIcon'

/** Format a number as NZD currency */
function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(n)
}

/** Custom tooltip that appears when you hover the bar chart */
function BudgetTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.fill }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

export default function Reports() {
  // Month is set by the header month-picker and passed down via outlet context
  const { month } = useOutletContext<{ month: string }>()

  // ── Data fetching ───────────────────────────────────────────────────────────

  const { data: budgetVsActual = [], isLoading: bvaLoading } = useQuery({
    queryKey: ['budget-vs-actual', month],
    queryFn:  () => getBudgetVsActual(month),
  })

  const { data: spendByCategory = [], isLoading: sbcLoading } = useQuery({
    queryKey: ['spend-by-category', month],
    queryFn:  () => getSpendByCategory(month),
  })

  // Fetch ALL expenses for the month (large limit) — only used for CSV export
  const { data: expensesData } = useQuery({
    queryKey: ['expenses-export', month],
    queryFn:  () => getExpenses({ month, page: 1, limit: 1000 }),
  })

  // ── CSV export ──────────────────────────────────────────────────────────────

  const handleExport = () => {
    const expenses = expensesData?.data ?? []
    if (expenses.length === 0) return

    // Build CSV rows — header + one row per expense
    const header = ['Date', 'Description', 'Category', 'Amount (NZD)']
    const rows = expenses.map(e => [
      new Date(e.date).toLocaleDateString('en-NZ'),
      `"${e.description.replace(/"/g, '""')}"`,  // escape quotes in description
      e.category.name,
      Number(e.amount).toFixed(2),
    ])

    const csv = [header, ...rows].map(r => r.join(',')).join('\n')

    // Create a temporary link and click it to trigger browser download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `expenses-${month}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Total spend across all categories this month
  const totalSpend = spendByCategory.reduce((sum, s) => sum + s.totalSpent, 0)

  // Format budget vs actual data for Recharts
  // Shorten long category names so they fit on the X axis
  const chartData = budgetVsActual.map(item => ({
    name:    item.category.name.length > 10 ? item.category.name.slice(0, 9) + '…' : item.category.name,
    Budget:  item.budget,
    Spent:   item.spent,
    color:   item.category.color,
    pct:     item.percentUsed,
  }))

  return (
    <div className="space-y-6">

      {/* ── Header with export button ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Report</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{month}</p>
        </div>
        <button
          onClick={handleExport}
          disabled={!expensesData?.data?.length}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* ── Budget vs Actual bar chart ────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Budget vs Actual
          </h3>
        </div>

        {bvaLoading ? (
          // Loading skeleton for the chart area
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        ) : budgetVsActual.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">
            No budgets set for this month.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<BudgetTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
              />
              {/* Green bars = budget limit */}
              <Bar dataKey="Budget" fill="#10b981" radius={[4, 4, 0, 0]} />
              {/* Teal bars = amount actually spent */}
              <Bar dataKey="Spent"  fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Category breakdown table ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-4 h-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Spend by Category
          </h3>
        </div>

        {sbcLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full" />
                </div>
                <div className="h-4 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : spendByCategory.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">
            No expenses recorded this month.
          </p>
        ) : (
          // Sort highest spend first
          <div className="space-y-4">
            {[...spendByCategory]
              .sort((a, b) => b.totalSpent - a.totalSpent)
              .map((item) => {
                const pct = totalSpend > 0 ? Math.round((item.totalSpent / totalSpend) * 100) : 0
                return (
                  <div key={item.category.id} className="flex items-center gap-3">
                    <CategoryIcon icon={item.category.icon} color={item.category.color} size="md" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {item.category.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                          {pct}%
                        </span>
                      </div>
                      {/* Coloured progress bar — width represents share of total spend */}
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: item.category.color }}
                        />
                      </div>
                    </div>

                    <span className="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0 w-20 text-right">
                      {formatCurrency(item.totalSpent)}
                    </span>
                  </div>
                )
              })}

            {/* Total row */}
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100 dark:border-gray-800">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalSpend)}
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
