/**
 * api/expenses.ts — Expense API calls
 *
 * All functions talk to the NestJS /expenses endpoints.
 * Used with React Query so results are cached and re-fetched automatically.
 */

import api from './axios'
import type { PaginatedExpenses } from '../types'

export interface ExpenseFilters {
  month?: string
  categoryId?: string
  page?: number
  limit?: number
}

export interface ExpensePayload {
  amount: string
  description: string
  date: string       // ISO date string
  categoryId: string
}

/** Fetch a paginated, filtered list of expenses */
export const getExpenses = async (filters: ExpenseFilters): Promise<PaginatedExpenses> => {
  const { data } = await api.get('/expenses', { params: filters })
  return data
}

/** Log a new expense */
export const createExpense = async (payload: ExpensePayload) => {
  const { data } = await api.post('/expenses', payload)
  return data
}

/** Update an existing expense */
export const updateExpense = async (id: string, payload: Partial<ExpensePayload>) => {
  const { data } = await api.patch(`/expenses/${id}`, payload)
  return data
}

/** Delete an expense */
export const deleteExpense = async (id: string) => {
  const { data } = await api.delete(`/expenses/${id}`)
  return data
}
