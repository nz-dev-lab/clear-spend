/**
 * api/budgets.ts — Budget API calls
 *
 * Budgets are monthly spending limits per category.
 * POST uses upsert — creates or updates based on user + category + month uniqueness.
 */

import api from './axios'
import type { Budget } from '../types'

export const getBudgets = async (month: string): Promise<Budget[]> => {
  const { data } = await api.get('/budgets', { params: { month } })
  return data
}

export const upsertBudget = async (payload: {
  amount: string
  month: string
  categoryId: string
}) => {
  const { data } = await api.post('/budgets', payload)
  return data
}

export const updateBudget = async (id: string, amount: string) => {
  const { data } = await api.patch(`/budgets/${id}`, { amount })
  return data
}

export const deleteBudget = async (id: string) => {
  const { data } = await api.delete(`/budgets/${id}`)
  return data
}
