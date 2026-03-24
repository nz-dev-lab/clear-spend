/**
 * Expenses.tsx — Expense log page
 *
 * The most-used page in the app. Students come here to:
 *   - See all their expenses for the selected month
 *   - Filter by category
 *   - Add, edit, or delete expenses
 *
 * Layout:
 *   - Filter bar: category dropdown + result count
 *   - Expense list: one card per expense (mobile) / table row (desktop)
 *   - Floating "+ Add" button fixed to bottom right
 *   - Pagination controls at the bottom
 */

import { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Filter, Receipt, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

import { getExpenses, deleteExpense } from '../api/expenses'
import { getCategories } from '../api/categories'
import ExpenseModal  from '../components/expenses/ExpenseModal'
import ConfirmDialog  from '../components/ui/ConfirmDialog'
import EmptyState     from '../components/ui/EmptyState'
import CategoryIcon   from '../components/ui/CategoryIcon'
import type { Expense } from '../types'

/** Format number as NZD currency */
function formatCurrency(amount: string | number): string {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(Number(amount))
}

/** Format ISO date string to readable format e.g. "15 Mar 2026" */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NZ', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

const PAGE_SIZE = 10

export default function Expenses() {
  const { month }    = useOutletContext<{ month: string }>()
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()

  // UI state
  const [page,           setPage]          = useState(1)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [modalOpen,      setModalOpen]      = useState(false)
  const [editExpense,    setEditExpense]    = useState<Expense | null>(null)
  const [deleteTarget,   setDeleteTarget]   = useState<Expense | null>(null)

  // Reset to page 1 whenever month or filter changes
  const handleFilterChange = (catId: string) => {
    setCategoryFilter(catId)
    setPage(1)
  }

  // ── Data fetching ──────────────────────────────────────────────────────────

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn:  getCategories,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', month, categoryFilter, page],
    queryFn:  () => getExpenses({
      month,
      categoryId: categoryFilter || undefined,
      page,
      limit: PAGE_SIZE,
    }),
  })

  const expenses   = data?.data    ?? []
  const meta       = data?.meta
  const totalPages = meta?.totalPages ?? 1

  // ── Delete mutation ────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
      queryClient.invalidateQueries({ queryKey: ['spend-by-category'] })
      queryClient.invalidateQueries({ queryKey: ['daily-trend'] })
      toast.success('Expense deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete expense'),
  })

  const openEdit = (expense: Expense) => {
    setEditExpense(expense)
    setModalOpen(true)
  }

  const openCreate = () => {
    setEditExpense(null)
    setModalOpen(true)
  }

  return (
    <div className="space-y-4">

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Category filter dropdown */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 flex-1 min-w-[160px] max-w-xs">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="flex-1 text-sm text-gray-700 dark:text-gray-300 bg-transparent outline-none"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Result count */}
        {meta && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {meta.total} expense{meta.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Expense list ────────────────────────────────────────────────────── */}
      {isLoading ? (
        // Skeleton loading rows
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 animate-pulse flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>

      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses yet"
          description={categoryFilter ? 'No expenses in this category for the selected month.' : 'Start tracking your spending by adding your first expense.'}
          action={{ label: 'Add expense', onClick: openCreate }}
        />

      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:shadow-sm transition-shadow"
            >
              {/* Category icon using Lucide */}
              <CategoryIcon icon={expense.category.icon} color={expense.category.color} size="lg" />

              {/* Description + date + category */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {expense.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(expense.date)}
                  </span>
                  {/* Category badge */}
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: expense.category.color + '22',
                      color: expense.category.color,
                    }}
                  >
                    {expense.category.name}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <span className="text-base font-bold text-gray-900 dark:text-white flex-shrink-0">
                {formatCurrency(expense.amount)}
              </span>

              {/* Edit / Delete action buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openEdit(expense)}
                  className="p-2 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
                  aria-label="Edit expense"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(expense)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                  aria-label="Delete expense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination controls ──────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page <= 1}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Floating add button — fixed bottom right ─────────────────────────── */}
      <button
        onClick={openCreate}
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-600 active:scale-95 text-white shadow-lg flex items-center justify-center transition-all"
        aria-label="Add expense"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* ── Expense modal (create / edit) ────────────────────────────────────── */}
      <ExpenseModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditExpense(null) }}
        expense={editExpense}
        defaultMonth={month}
      />

      {/* ── Delete confirmation dialog ───────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete expense?"
        description={deleteTarget ? `"${deleteTarget.description}" — ${formatCurrency(deleteTarget.amount)}` : ''}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
