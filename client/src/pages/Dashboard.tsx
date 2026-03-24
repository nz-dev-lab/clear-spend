/**
 * Dashboard.tsx — Home screen of the app
 *
 * Shows the student a quick financial overview for the selected month:
 *   1. Four summary stat cards (Spent, Budget, Remaining, % Used)
 *   2. Line chart — how spending has trended day by day
 *   3. Donut chart + category breakdown list — where the money went
 *
 * All data is fetched from the analytics endpoints and cached by React Query.
 * When the month changes in the header, all charts automatically refresh.
 */

import { useOutletContext, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  AlertCircle,
  Receipt,
} from 'lucide-react'

import { getMonthlySummary, getSpendByCategory, getDailyTrend } from '../api/analytics'
import StatCard from '../components/ui/StatCard'
import EmptyState from '../components/ui/EmptyState'

/** Format a number as a currency string, e.g. 1234.5 → "$1,234.50" */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(amount)
}

/** Shorten "2026-03-15" to "15" for the X axis — keeps the chart clean */
function shortDay(dateStr: string): string {
  return String(parseInt(dateStr.split('-')[2]))
}

/** Pick trend colour based on how much of the budget has been used */
function budgetTrendColor(percent: number): 'green' | 'amber' | 'red' {
  if (percent >= 100) return 'red'
  if (percent >= 80)  return 'amber'
  return 'green'
}

// Custom tooltip shown when hovering over the line chart
function LineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-lg border border-gray-100 dark:border-gray-700 text-sm">
      <p className="text-gray-500 dark:text-gray-400 mb-1">Day {label}</p>
      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

// Custom tooltip for the donut chart
function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-lg border border-gray-100 dark:border-gray-700 text-sm">
      <p className="font-semibold text-gray-900 dark:text-white">{payload[0].name}</p>
      <p className="text-gray-500 dark:text-gray-400">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export default function Dashboard() {
  // month is passed down from AppLayout via the router outlet context
  const { month } = useOutletContext<{ month: string }>()
  const navigate   = useNavigate()

  // ── Data fetching ─────────────────────────────────────────────────────────
  // React Query caches each response — switching months refetches automatically

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['monthly-summary', month],
    queryFn:  () => getMonthlySummary(month),
  })

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ['spend-by-category', month],
    queryFn:  () => getSpendByCategory(month),
  })

  const { data: dailyTrend = [], isLoading: trendLoading } = useQuery({
    queryKey: ['daily-trend', month],
    queryFn:  () => getDailyTrend(month),
  })

  // Check whether any spending exists this month
  const hasSpending = (summary?.totalSpent ?? 0) > 0

  return (
    <div className="space-y-6">

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      {/* 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          icon={Wallet}
          label="Total Spent"
          value={summaryLoading ? '—' : formatCurrency(summary?.totalSpent ?? 0)}
          trend={summary && `This month so far`}
          accent="teal"
          loading={summaryLoading}
        />

        <StatCard
          icon={PiggyBank}
          label="Total Budget"
          value={summaryLoading ? '—' : formatCurrency(summary?.totalBudget ?? 0)}
          trend={summary?.totalBudget === 0 ? 'No budgets set' : undefined}
          trendColor="gray"
          accent="purple"
          loading={summaryLoading}
        />

        <StatCard
          icon={TrendingUp}
          label="Remaining"
          value={summaryLoading ? '—' : formatCurrency(summary?.remaining ?? 0)}
          trend={summary && (summary.remaining >= 0 ? 'Under budget' : 'Over budget!')}
          trendColor={summary ? (summary.remaining >= 0 ? 'green' : 'red') : 'gray'}
          accent={summary && summary.remaining < 0 ? 'red' : 'green'}
          loading={summaryLoading}
        />

        <StatCard
          icon={AlertCircle}
          label="Budget Used"
          value={summaryLoading ? '—' : `${summary?.percentUsed ?? 0}%`}
          trend={summary && summary.totalBudget > 0
            ? `${summary.percentUsed}% of budget`
            : 'No budgets set'}
          trendColor={summary ? budgetTrendColor(summary.percentUsed ?? 0) : 'gray'}
          accent={summary && (summary.percentUsed ?? 0) >= 100 ? 'red' : 'amber'}
          loading={summaryLoading}
        />
      </div>

      {/* ── Line chart — daily spending trend ──────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Daily Spending Trend
        </h2>

        {trendLoading ? (
          // Loading skeleton for chart
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        ) : !hasSpending ? (
          <EmptyState
            icon={Receipt}
            title="No expenses yet"
            description="Start logging your spending to see your daily trend here."
            action={{ label: 'Add expense', onClick: () => navigate('/expenses') }}
          />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              {/* Subtle grid lines */}
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />

              {/* X axis shows day number, only every 5th label to avoid crowding */}
              <XAxis
                dataKey="date"
                tickFormatter={shortDay}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                interval={4}
                axisLine={false}
                tickLine={false}
              />

              {/* Y axis shows currency values */}
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip content={<LineTooltip />} />

              {/* The teal spending line with a gradient dot on data points */}
              <Line
                type="monotone"
                dataKey="total"
                stroke="#14b8a6"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Bottom row: donut chart + category list ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Donut chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Spending by Category
          </h2>

          {catLoading ? (
            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ) : categories.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Nothing to show"
              description="Add some expenses this month to see the breakdown."
            />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="totalSpent"
                  nameKey="category.name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}   // innerRadius makes it a donut (ring) shape
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {/* Each slice uses the category's own color from the DB */}
                  {categories.map((entry, i) => (
                    <Cell key={i} fill={entry.category.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category breakdown list */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Top Categories
          </h2>

          {catLoading ? (
            // Skeleton rows
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full" />
                  </div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              No spending recorded yet
            </p>
          ) : (
            <div className="space-y-3">
              {categories.slice(0, 6).map((item) => {
                // Calculate what percentage of total spending this category represents
                const total = categories.reduce((s, c) => s + c.totalSpent, 0)
                const pct   = total > 0 ? Math.round((item.totalSpent / total) * 100) : 0

                return (
                  <div key={item.category.id} className="flex items-center gap-3">
                    {/* Colored category icon circle */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                      style={{ backgroundColor: item.category.color + '22' }} // 22 = ~13% opacity hex
                    >
                      <span style={{ color: item.category.color }}>
                        {item.category.icon}
                      </span>
                    </div>

                    {/* Name + progress bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {item.category.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                          {pct}%
                        </span>
                      </div>
                      {/* Progress bar using category's own color */}
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: item.category.color }}
                        />
                      </div>
                    </div>

                    {/* Amount */}
                    <span className="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0 ml-2">
                      {formatCurrency(item.totalSpent)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
