/**
 * Categories.tsx — Manage spending categories
 *
 * Students can create their own categories with a custom name,
 * colour, and icon. The default 6 categories are seeded on signup
 * and appear here too.
 *
 * Layout:
 *   - Grid of category cards (icon + name + edit/delete buttons)
 *   - Floating "+" button to create a new category
 *   - Modal for create / edit
 *   - Confirm dialog for delete
 *
 * Note: deleting a category also deletes all its expenses (cascade
 * set in Prisma), so we show a warning in the confirm dialog.
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2, Plus, Tag } from 'lucide-react'
import { toast } from 'sonner'

import { getCategories, deleteCategory } from '../api/categories'
import CategoryIcon from '../components/ui/CategoryIcon'
import CategoryModal from '../components/categories/CategoryModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import type { Category } from '../types'

export default function Categories() {
  const queryClient = useQueryClient()

  // Modal / dialog state
  const [modalOpen,    setModalOpen]    = useState(false)
  const [editTarget,   setEditTarget]   = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  // ── Fetch categories ────────────────────────────────────────────────────────

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn:  getCategories,
  })

  // ── Delete mutation ─────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      // Invalidate everything that depends on categories
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['spend-by-category'] })
      toast.success('Category deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete category'),
  })

  const openCreate = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditTarget(cat)
    setModalOpen(true)
  }

  return (
    <div className="space-y-4">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Categories</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
      </div>

      {/* ── Category grid ─────────────────────────────────────────────────── */}
      {isLoading ? (
        // Skeleton loading state while data is fetching
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 animate-pulse flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>

      ) : categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No categories yet"
          description="Create a category to start organising your expenses."
          action={{ label: 'Create category', onClick: openCreate }}
        />

      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow flex flex-col items-center gap-3 relative group"
            >
              {/* Edit / delete buttons — always visible on mobile, hover on desktop */}
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
                  aria-label="Edit category"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget(cat)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                  aria-label="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Category icon — large size for the card */}
              <CategoryIcon icon={cat.icon} color={cat.color} size="lg" />

              {/* Category name */}
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 text-center leading-tight">
                {cat.name}
              </span>

              {/* Colour dot indicator */}
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Floating add button ───────────────────────────────────────────── */}
      <button
        onClick={openCreate}
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-600 active:scale-95 text-white shadow-lg flex items-center justify-center transition-all"
        aria-label="Add category"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* ── Category create / edit modal ──────────────────────────────────── */}
      <CategoryModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null) }}
        existing={editTarget}
      />

      {/* ── Delete confirmation dialog ────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete category?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" and all its expenses will be permanently deleted.`
            : ''
        }
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
