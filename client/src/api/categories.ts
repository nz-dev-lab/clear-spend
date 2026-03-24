/**
 * api/categories.ts — Category API calls
 *
 * Categories are used across multiple pages (Expenses, Budgets, Categories).
 * Fetching them here keeps things consistent.
 */

import api from './axios'
import type { Category } from '../types'

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get('/categories')
  return data
}

export const createCategory = async (payload: { name: string; icon: string; color: string }) => {
  const { data } = await api.post('/categories', payload)
  return data
}

export const updateCategory = async (id: string, payload: { name?: string; icon?: string; color?: string }) => {
  const { data } = await api.patch(`/categories/${id}`, payload)
  return data
}

export const deleteCategory = async (id: string) => {
  const { data } = await api.delete(`/categories/${id}`)
  return data
}
