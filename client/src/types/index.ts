/**
 * types/index.ts — Shared TypeScript types used across the frontend
 *
 * These mirror the data shapes returned by the NestJS API.
 * Keeping them in one place means if the API changes, we only update here.
 */

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  userId: string
  createdAt: string
}

export interface Expense {
  id: string
  amount: string        // Prisma Decimal comes back as a string — parse before maths
  description: string
  date: string
  categoryId: string
  userId: string
  createdAt: string
  updatedAt: string
  category: Pick<Category, 'id' | 'name' | 'icon' | 'color'>
}

export interface Budget {
  id: string
  amount: string        // Also a Decimal string
  month: string         // "YYYY-MM"
  categoryId: string
  userId: string
  createdAt: string
  updatedAt: string
  category: Pick<Category, 'id' | 'name' | 'icon' | 'color'>
}

// Pagination wrapper returned by GET /expenses
export interface PaginatedExpenses {
  data: Expense[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Analytics response types
export interface MonthlySummary {
  totalSpent: number
  totalBudget: number
  remaining: number
  percentUsed: number
  month: string
}

export interface SpendByCategory {
  category: Pick<Category, 'id' | 'name' | 'icon' | 'color'>
  totalSpent: number
}

export interface DailyTrend {
  date: string
  total: number
}

export interface BudgetVsActual {
  category: Pick<Category, 'id' | 'name' | 'icon' | 'color'>
  budget: number
  spent: number
  remaining: number
  percentUsed: number
}
