/**
 * CategoryModal.tsx — Create or edit a category
 *
 * Lets the user pick:
 *   - A name (text input)
 *   - A colour (row of preset swatches)
 *   - An icon (grid of Lucide icons from AVAILABLE_ICONS)
 *
 * Used for both creating a new category and editing an existing one.
 * The same API endpoint handles both (POST vs PATCH).
 */

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { createCategory, updateCategory } from '../../api/categories'
import { AVAILABLE_ICONS } from '../../utils/categoryIcons'
import type { Category } from '../../types'

// Preset colour palette for the colour picker
const PRESET_COLORS = [
  '#F97316', // Orange  (Food)
  '#3B82F6', // Blue    (Transport)
  '#8B5CF6', // Purple  (Books)
  '#EC4899', // Pink    (Entertainment)
  '#10B981', // Green   (Health)
  '#6B7280', // Gray    (Other)
  '#14B8A6', // Teal
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#A855F7', // Violet
]

interface CategoryModalProps {
  open: boolean
  onClose: () => void
  existing: Category | null  // null = create mode, Category = edit mode
}

export default function CategoryModal({ open, onClose, existing }: CategoryModalProps) {
  const queryClient = useQueryClient()

  // Form field state
  const [name,  setName]  = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [icon,  setIcon]  = useState(AVAILABLE_ICONS[0].key)
  const [error, setError] = useState('')

  // When the modal opens, pre-fill the form if editing
  useEffect(() => {
    if (open) {
      setName(existing?.name  ?? '')
      setColor(existing?.color ?? PRESET_COLORS[0])
      // If it's an emoji (seeded category) map to first icon as fallback
      const matchedIcon = AVAILABLE_ICONS.find(i => i.key === existing?.icon)
      setIcon(matchedIcon?.key ?? AVAILABLE_ICONS[0].key)
      setError('')
    }
  }, [open, existing])

  // Create mutation (POST /categories)
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category created!')
      onClose()
    },
    onError: () => toast.error('Failed to create category'),
  })

  // Update mutation (PATCH /categories/:id)
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string; icon: string; color: string } }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      // Refresh categories everywhere — expenses, budgets, dashboard all use them
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['spend-by-category'] })
      toast.success('Category updated!')
      onClose()
    },
    onError: () => toast.error('Failed to update category'),
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Category name is required')
      return
    }
    const payload = { name: name.trim(), icon, color }
    if (existing) {
      updateMutation.mutate({ id: existing.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {existing ? 'Edit Category' : 'New Category'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* ── Name input ──────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Name
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="e.g. Groceries"
              className={`w-full px-4 py-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${
                error
                  ? 'border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900'
                  : 'border-gray-200 dark:border-gray-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900'
              }`}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>

          {/* ── Colour picker ───────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Colour
            </label>
            {/* Grid of colour swatches — tap to select */}
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          {/* ── Icon picker ─────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icon
            </label>
            {/* Grid of icon buttons — each shows a Lucide icon with label */}
            <div className="grid grid-cols-5 gap-2">
              {AVAILABLE_ICONS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIcon(key)}
                  title={label}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-all ${
                    icon === key
                      ? 'border-primary-400 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {/* Render the Lucide icon — colour it with the selected category colour */}
                  <Icon className="w-5 h-5" style={{ color: icon === key ? color : undefined }} strokeWidth={2} />
                  <span className="truncate w-full text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Preview ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <span className="text-xs text-gray-500 dark:text-gray-400">Preview:</span>
            {/* Show how the category will look on expense cards etc. */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: color + '22' }}
            >
              {(() => {
                const { Icon } = AVAILABLE_ICONS.find(i => i.key === icon) ?? AVAILABLE_ICONS[0]
                return <Icon className="w-5 h-5" style={{ color }} strokeWidth={2} />
              })()}
            </div>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              {name || 'Category name'}
            </span>
          </div>

          {/* ── Submit ──────────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-all disabled:opacity-60"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? 'Saving…' : existing ? 'Save changes' : 'Create category'}
          </button>
        </form>
      </div>
    </div>
  )
}
