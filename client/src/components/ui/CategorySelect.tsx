/**
 * CategorySelect.tsx — Custom category picker dropdown
 *
 * Replaces the native <select> element which can only show plain text.
 * This renders each category with its coloured icon circle and name,
 * matching the style used across the rest of the app.
 *
 * Uses Lucide's ChevronDown icon for the dropdown indicator.
 */

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import CategoryIcon from './CategoryIcon'
import type { Category } from '../../types'

interface CategorySelectProps {
  categories: Category[]
  value: string               // selected categoryId
  onChange: (id: string) => void
  error?: boolean
  placeholder?: string
}

export default function CategorySelect({
  categories,
  value,
  onChange,
  error = false,
  placeholder = 'Select a category',
}: CategorySelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = categories.find(c => c.id === value)

  return (
    <div ref={ref} className="relative">

      {/* Trigger button — shows selected category or placeholder */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left bg-gray-50 dark:bg-gray-800 outline-none transition-all ${
          error
            ? 'border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900'
            : open
            ? 'border-primary-400 ring-2 ring-primary-100 dark:ring-primary-900'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        {selected ? (
          <>
            {/* Category icon using Lucide */}
            <CategoryIcon icon={selected.icon} color={selected.color} size="sm" />
            <span className="flex-1 text-gray-900 dark:text-white">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1 text-gray-400">{placeholder}</span>
        )}

        {/* Lucide chevron icon — rotates when open */}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown list */}
      {open && (
        <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
          <ul className="max-h-52 overflow-y-auto py-1">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => { onChange(cat.id); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    value === cat.id ? 'bg-primary-50 dark:bg-primary-950' : ''
                  }`}
                >
                  {/* Category icon using Lucide */}
                  <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />

                  <span className={`flex-1 ${value === cat.id ? 'font-semibold text-primary-700 dark:text-primary-300' : 'text-gray-800 dark:text-gray-200'}`}>
                    {cat.name}
                  </span>

                  {/* Lucide checkmark for the currently selected item */}
                  {value === cat.id && (
                    <Check className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
