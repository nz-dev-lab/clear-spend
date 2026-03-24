/**
 * BudgetModal.tsx — Set or edit a budget for a category
 *
 * A simple modal with a single amount input.
 * Used both for setting a new budget and updating an existing one.
 * Since the API uses upsert, the same endpoint handles both cases.
 */

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { upsertBudget } from '../../api/budgets'
import CategoryIcon from '../ui/CategoryIcon'
import type { Category, Budget } from '../../types'

interface BudgetModalProps {
  open: boolean
  onClose: () => void
  category: Category | null   // which category we're setting a budget for
  existing: Budget | null     // existing budget (if editing) or null (if new)
  month: string               // "YYYY-MM"
}

export default function BudgetModal({
  open,
  onClose,
  category,
  existing,
  month,
}: BudgetModalProps) {
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')
  const [error,  setError]  = useState('')

  // Pre-fill the amount if we're editing an existing budget
  useEffect(() => {
    if (open) {
      setAmount(existing ? existing.amount : '')
      setError('')
    }
  }, [open, existing])

  const mutation = useMutation({
    mutationFn: upsertBudget,
    onSuccess: () => {
      // Refresh budget list and all analytics that depend on budget data
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
      queryClient.invalidateQueries({ queryKey: ['budget-vs-actual'] })
      toast.success(existing ? 'Budget updated!' : 'Budget set!')
      onClose()
    },
    onError: () => toast.error('Failed to save budget'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Enter a valid amount greater than 0')
      return
    }
    if (!category) return

    mutation.mutate({
      amount:     Number(amount).toFixed(2),
      month,
      categoryId: category.id,
    })
  }

  if (!open || !category) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full sm:max-w-sm bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">

        {/* Header showing which category we're budgeting for */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {/* Category icon */}
            <CategoryIcon icon={category.icon} color={category.color} size="md" />
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {existing ? 'Edit Budget' : 'Set Budget'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{category.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Monthly limit (NZD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                autoFocus
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError('') }}
                placeholder="0.00"
                className={`w-full pl-8 pr-4 py-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${
                  error
                    ? 'border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900'
                    : 'border-gray-200 dark:border-gray-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900'
                }`}
              />
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              This is how much you plan to spend on {category.name} in this month.
            </p>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-all disabled:opacity-60"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {mutation.isPending ? 'Saving…' : existing ? 'Update budget' : 'Set budget'}
          </button>
        </form>
      </div>
    </div>
  )
}
