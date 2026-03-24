/**
 * api/analytics.ts — Analytics API calls
 *
 * These functions fetch the data that powers all the charts and summary cards.
 * They're used with React Query's useQuery hook so results are cached automatically.
 */

import api from './axios'
import type { MonthlySummary, SpendByCategory, DailyTrend, BudgetVsActual } from '../types'

/** Fetch top-level summary: total spent, budget, % used */
export const getMonthlySummary = async (month: string): Promise<MonthlySummary> => {
  const { data } = await api.get('/analytics/monthly-summary', { params: { month } })
  return data
}

/** Fetch spending broken down by category — for donut chart */
export const getSpendByCategory = async (month: string): Promise<SpendByCategory[]> => {
  const { data } = await api.get('/analytics/spend-by-category', { params: { month } })
  return data
}

/** Fetch daily spending totals — for line chart */
export const getDailyTrend = async (month: string): Promise<DailyTrend[]> => {
  const { data } = await api.get('/analytics/daily-trend', { params: { month } })
  return data
}

/** Fetch budget vs actual per category — for bar chart on Reports page */
export const getBudgetVsActual = async (month: string): Promise<BudgetVsActual[]> => {
  const { data } = await api.get('/analytics/budget-vs-actual', { params: { month } })
  return data
}
