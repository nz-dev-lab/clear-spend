/**
 * ExpenseModal.tsx — Create / Edit expense slide-up modal
 *
 * Used for both adding a new expense and editing an existing one.
 * When `expense` prop is provided it's edit mode, otherwise create mode.
 *
 * Fields:
 *   - Amount      (number input)
 *   - Description (text)
 *   - Date        (date picker)
 *   - Category    (dropdown with color-coded options)
 */

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getCategories } from '../../api/categories'
import { createExpense, updateExpense } from '../../api/expenses'
import CategorySelect from '../ui/CategorySelect'
import type { Expense } from '../../types'

interface ExpenseModalProps {
  open: boolean
  onClose: () => void
  expense?: Expense | null   // if provided, we're in edit mode
  defaultMonth: string       // pre-fills the date to the selected month
}

export default function ExpenseModal({ open, onClose, expense, defaultMonth }: ExpenseModalProps) {
  const queryClient = useQueryClient()
  const isEdit = !!expense

  // Form state
  const [amount,      setAmount]      = useState('')
  const [description, setDescription] = useState('')
  const [date,        setDate]        = useState('')
  const [categoryId,  setCategoryId]  = useState('')
  const [errors,      setErrors]      = useState<Record<string, string>>({})

  // Populate form fields when editing an existing expense
  useEffect(() => {
    if (expense) {
      setAmount(expense.amount)
      setDescription(expense.description)
      setDate(expense.date.slice(0, 10)) // "2026-03-15T..." → "2026-03-15"
      setCategoryId(expense.categoryId)
    } else {
      // Default date to the first of the selected month
      setAmount('')
      setDescription('')
      setDate(`${defaultMonth}-01`)
      setCategoryId('')
    }
    setErrors({})
  }, [expense, open, defaultMonth])

  // Fetch categories for the dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      // Invalidate expense + analytics queries so they refresh automatically
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
      queryClient.invalidateQueries({ queryKey: ['spend-by-category'] })
      queryClient.invalidateQueries({ queryKey: ['daily-trend'] })
      toast.success('Expense added!')
      onClose()
    },
    onError: () => toast.error('Failed to add expense'),
  })

  // Edit mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
      queryClient.invalidateQueries({ queryKey: ['spend-by-category'] })
      queryClient.invalidateQueries({ queryKey: ['daily-trend'] })
      toast.success('Expense updated!')
      onClose()
    },
    onError: () => toast.error('Failed to update expense'),
  })

  const loading = createMutation.isPending || updateMutation.isPending

  // Client-side validation
  const validate = () => {
    const e: Record<string, string> = {}
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = 'Enter a valid amount'
    if (!description.trim()) e.description = 'Description is required'
    if (!date)               e.date        = 'Date is required'
    if (!categoryId)         e.categoryId  = 'Select a category'
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const payload = {
      amount:      Number(amount).toFixed(2),
      description: description.trim(),
      date:        new Date(date).toISOString(),
      categoryId,
    }

    if (isEdit) {
      updateMutation.mutate({ id: expense!.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  if (!open) return null

  // Input class helper
  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${
      errors[field]
        ? 'border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900'
        : 'border-gray-200 dark:border-gray-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900'
    }`

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">

      {/* Modal panel — slides up from bottom on mobile, centered on desktop */}
      <div className="w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Amount (NZD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors(v => ({ ...v, amount: '' })) }}
                placeholder="0.00"
                className={inputClass('amount') + ' pl-8'}
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors(v => ({ ...v, description: '' })) }}
              placeholder="e.g. Lunch at uni cafe"
              className={inputClass('description')}
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setErrors(v => ({ ...v, date: '' })) }}
              className={inputClass('date')}
            />
            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
          </div>

          {/* Category picker — custom dropdown with coloured icons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Category
            </label>
            <CategorySelect
              categories={categories}
              value={categoryId}
              onChange={(id) => { setCategoryId(id); setErrors(v => ({ ...v, categoryId: '' })) }}
              error={!!errors.categoryId}
            />
            {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Add expense'}
          </button>
        </form>
      </div>
    </div>
  )
}
