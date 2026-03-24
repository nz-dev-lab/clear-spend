/**
 * Budgets.tsx — Monthly budget management page
 *
 * Shows every category as a card. If a budget has been set for that
 * category this month, a colour-coded progress bar shows how much
 * has been spent vs the limit.
 *
 * Colour coding (Monzo-style):
 *   Green  — under 80% used (on track)
 *   Amber  — 80–99% used (getting close)
 *   Red    — 100%+ used (over budget!)
 *
 * Each card has:
 *   - Category icon + name
 *   - Progress bar
 *   - "£X of £Y" spent label
 *   - Edit / Remove budget buttons (if budget exists)
 *   - "Set budget" button (if no budget yet)
 */

import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PiggyBank, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'

import { getCategories }        from '../api/categories'
import { getBudgets, deleteBudget } from '../api/budgets'
import { getSpendByCategory }   from '../api/analytics'
import BudgetModal              from '../components/budgets/BudgetModal'
import ConfirmDialog            from '../components/ui/ConfirmDialog'
import EmptyState               from '../components/ui/EmptyState'
import type { Category, Budget } from '../types'

/** Format a number as NZD currency */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(amount)
}

/** Return the right progress bar colour based on percentage used */
function progressColor(pct: number): string {
  if (pct >= 100) return '#ef4444' // red
  if (pct >= 80)  return '#f59e0b' // amber
  return '#14b8a6'                  // teal (primary)
}

/** Return background tint for the card based on percentage */
function cardBorderColor(pct: number): string {
  if (pct >= 100) return 'border-red-200 dark:border-red-900'
  if (pct >= 80)  return 'border-amber-200 dark:border-amber-900'
  return 'border-gray-100 dark:border-gray-800'
}

export default function Budgets() {
  const { month }   = useOutletContext<{ month: string }>()
  const queryClient = useQueryClient()

  // Modal state
  const [modalOpen,     setModalOpen]     = useState(false)
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [activeBudget,   setActiveBudget]   = useState<Budget | null>(null)
  const [deleteTarget,   setDeleteTarget]   = useState<Budget | null>(null)

  // ── Data fetching ──────────────────────────────────────────────────────────

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn:  getCategories,
  })

  const { data: budgets = [], isLoading: budgetLoading } = useQuery({
    queryKey: ['budgets', month],
    queryFn:  () => getBudgets(month),
  })

  const { data: spending = [] } = useQuery({
    queryKey: ['spend-by-category', month],
    queryFn:  () => getSpendByCategory(month),
  })

  const isLoading = catLoading || budgetLoading

  // Build a lookup map: categoryId → budget
  const budgetMap = new Map(budgets.map(b => [b.categoryId, b]))

  // Build a lookup map: categoryId → amount spent this month
  const spendMap = new Map(spending.map(s => [s.category.id, s.totalSpent]))

  // ── Delete mutation ────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
      queryClient.invalidateQueries({ queryKey: ['budget-vs-actual'] })
      toast.success('Budget removed')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to remove budget'),
  })

  const openSetBudget = (category: Category, existing: Budget | null) => {
    setActiveCategory(category)
    setActiveBudget(existing)
    setModalOpen(true)
  }

  // Summary totals across all budgeted categories
  const totalBudget  = budgets.reduce((s, b) => s + Number(b.amount), 0)
  const totalSpent   = budgets.reduce((s, b) => s + (spendMap.get(b.categoryId) ?? 0), 0)
  const overallPct   = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 999) : 0

  return (
    <div className="space-y-5">

      {/* ── Overall summary banner ─────────────────────────────────────────── */}
      {budgets.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total budget used</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                {overallPct}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(totalSpent)} <span className="text-gray-400">of</span> {formatCurrency(totalBudget)}
              </p>
              <p className={`text-sm font-semibold mt-0.5 ${
                totalBudget - totalSpent >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-500 dark:text-red-400'
              }`}>
                {totalBudget - totalSpent >= 0
                  ? `${formatCurrency(totalBudget - totalSpent)} remaining`
                  : `${formatCurrency(totalSpent - totalBudget)} over budget`}
              </p>
            </div>
          </div>
          {/* Overall progress bar */}
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(overallPct, 100)}%`,
                backgroundColor: progressColor(overallPct),
              }}
            />
          </div>
        </div>
      )}

      {/* ── Category budget cards grid ─────────────────────────────────────── */}
      {isLoading ? (
        // Skeleton grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          ))}
        </div>

      ) : categories.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No categories yet"
          description="Create some categories first, then set budgets for them."
        />

      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const budget  = budgetMap.get(category.id) ?? null
            const spent   = spendMap.get(category.id) ?? 0
            const limit   = budget ? Number(budget.amount) : 0
            const pct     = limit > 0 ? Math.round((spent / limit) * 100) : 0
            const hasBudget = !!budget

            return (
              <div
                key={category.id}
                className={`bg-white dark:bg-gray-900 rounded-2xl p-5 border transition-shadow hover:shadow-md ${
                  hasBudget ? cardBorderColor(pct) : 'border-gray-100 dark:border-gray-800'
                }`}
              >
                {/* Category header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-base"
                      style={{ backgroundColor: category.color + '22' }}
                    >
                      <span style={{ color: category.color }}>{category.icon}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {category.name}
                    </span>
                  </div>

                  {/* Edit / delete buttons only if budget exists */}
                  {hasBudget && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openSetBudget(category, budget)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
                        aria-label="Edit budget"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(budget)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        aria-label="Remove budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {hasBudget ? (
                  <>
                    {/* Spent vs budget text */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(spent)} spent
                      </span>
                      <span className={`text-xs font-semibold ${
                        pct >= 100 ? 'text-red-500' : pct >= 80 ? 'text-amber-500' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {pct}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          backgroundColor: progressColor(pct),
                        }}
                      />
                    </div>

                    {/* Limit label */}
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Limit: {formatCurrency(limit)}
                      {pct >= 100 && (
                        <span className="text-red-500 ml-1 font-medium">
                          — {formatCurrency(spent - limit)} over
                        </span>
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    {/* No budget set — show dashed placeholder bar + CTA */}
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-3 border-2 border-dashed border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={() => openSetBudget(category, null)}
                      className="w-full py-2 rounded-xl border border-dashed border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 text-xs font-semibold hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
                    >
                      + Set budget
                    </button>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Budget modal ──────────────────────────────────────────────────── */}
      <BudgetModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setActiveCategory(null); setActiveBudget(null) }}
        category={activeCategory}
        existing={activeBudget}
        month={month}
      />

      {/* ── Delete confirmation ───────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove budget?"
        description="The spending data won't be deleted, just the budget limit for this category."
        confirmLabel="Remove"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
