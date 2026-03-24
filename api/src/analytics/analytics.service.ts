/**
 * analytics.service.ts — Read-only data for charts and summaries
 *
 * This service powers all the visual data in the app:
 *   - Dashboard summary cards (total spent, total budget, % used)
 *   - Donut chart (spending broken down by category)
 *   - Line chart (daily spending trend across the month)
 *   - Bar chart (budget set vs money actually spent, per category)
 *
 * All endpoints accept a ?month=YYYY-MM param — defaults to the current month.
 * All data is scoped to the logged-in user.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Helper — converts a "YYYY-MM" string (or current month) into a date range.
   * Returns { start, end } where start = first day, end = first day of next month.
   * Prisma uses gte/lt on these to filter expenses within the month.
   */
  private getMonthRange(month?: string): { start: Date; end: Date; month: string } {
    // If no month given, default to the current month
    const target = month ?? new Date().toISOString().slice(0, 7);
    const [year, mon] = target.split('-').map(Number);
    return {
      start: new Date(year, mon - 1, 1),   // e.g. 2026-03-01
      end:   new Date(year, mon, 1),        // e.g. 2026-04-01 (exclusive upper bound)
      month: target,
    };
  }

  /**
   * GET /analytics/monthly-summary
   *
   * Returns the top-level numbers shown on the dashboard summary cards:
   *   - totalSpent:    how much the student spent this month
   *   - totalBudget:   sum of all budgets set for this month
   *   - percentUsed:   totalSpent / totalBudget × 100
   *   - remaining:     totalBudget - totalSpent
   */
  async monthlySummary(userId: string, month?: string) {
    const { start, end, month: targetMonth } = this.getMonthRange(month);

    // Sum all expenses for this user in the given month
    const expenseAgg = await this.prisma.expense.aggregate({
      where: { userId, date: { gte: start, lt: end } },
      _sum: { amount: true },
    });

    // Sum all budgets for this user in the given month
    const budgetAgg = await this.prisma.budget.aggregate({
      where: { userId, month: targetMonth },
      _sum: { amount: true },
    });

    const totalSpent  = Number(expenseAgg._sum.amount ?? 0);
    const totalBudget = Number(budgetAgg._sum.amount  ?? 0);
    const remaining   = totalBudget - totalSpent;
    const percentUsed = totalBudget > 0
      ? Math.round((totalSpent / totalBudget) * 100)
      : 0;

    return { totalSpent, totalBudget, remaining, percentUsed, month: targetMonth };
  }

  /**
   * GET /analytics/spend-by-category
   *
   * Returns how much was spent in each category for the month.
   * Used to render the donut/pie chart on the dashboard.
   *
   * Example response:
   *   [{ category: { name: "Food", color: "#F97316" }, totalSpent: 45.20 }, ...]
   */
  async spendByCategory(userId: string, month?: string) {
    const { start, end } = this.getMonthRange(month);

    // Fetch all expenses for the month with their category info
    const expenses = await this.prisma.expense.findMany({
      where: { userId, date: { gte: start, lt: end } },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    });

    // Group expenses by category and sum amounts in JavaScript
    // (Prisma groupBy doesn't support joining relation data easily)
    const grouped = new Map<string, { category: any; totalSpent: number }>();

    for (const expense of expenses) {
      const key = expense.categoryId;
      if (!grouped.has(key)) {
        grouped.set(key, { category: expense.category, totalSpent: 0 });
      }
      grouped.get(key)!.totalSpent += Number(expense.amount);
    }

    // Sort by highest spending first — most relevant categories at the top
    return Array.from(grouped.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .map(item => ({
        ...item,
        totalSpent: Math.round(item.totalSpent * 100) / 100, // round to 2dp
      }));
  }

  /**
   * GET /analytics/daily-trend
   *
   * Returns the total amount spent on each day of the month.
   * Used to draw the line chart showing spending over time.
   *
   * Example response:
   *   [{ date: "2026-03-01", total: 12.50 }, { date: "2026-03-02", total: 0 }, ...]
   *
   * Days with no spending are included as 0 — this keeps the line chart smooth.
   */
  async dailyTrend(userId: string, month?: string) {
    const { start, end, month: targetMonth } = this.getMonthRange(month);

    const expenses = await this.prisma.expense.findMany({
      where: { userId, date: { gte: start, lt: end } },
      select: { date: true, amount: true },
      orderBy: { date: 'asc' },
    });

    // Build a map of date string → total amount
    const dailyMap = new Map<string, number>();
    for (const expense of expenses) {
      // Format date as "YYYY-MM-DD" string for grouping
      const dateKey = expense.date.toISOString().slice(0, 10);
      dailyMap.set(dateKey, (dailyMap.get(dateKey) ?? 0) + Number(expense.amount));
    }

    // Build a full array for every day in the month (fill missing days with 0)
    const [year, mon] = targetMonth.split('-').map(Number);
    const daysInMonth = new Date(year, mon, 0).getDate(); // e.g. 31 for March
    const result = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${targetMonth}-${String(day).padStart(2, '0')}`;
      result.push({
        date:  dateKey,
        total: Math.round((dailyMap.get(dateKey) ?? 0) * 100) / 100,
      });
    }

    return result;
  }

  /**
   * GET /analytics/budget-vs-actual
   *
   * For each category that has a budget set, shows how much was budgeted
   * vs how much was actually spent. Used for the bar chart on the Reports page.
   *
   * Example response:
   *   [{ category: { name: "Food" }, budget: 200, spent: 145.50, remaining: 54.50, percentUsed: 73 }]
   */
  async budgetVsActual(userId: string, month?: string) {
    const { start, end, month: targetMonth } = this.getMonthRange(month);

    // Get all budgets for this month with their category info
    const budgets = await this.prisma.budget.findMany({
      where: { userId, month: targetMonth },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    });

    // Get all expenses for this month grouped by category
    const expenses = await this.prisma.expense.findMany({
      where: { userId, date: { gte: start, lt: end } },
      select: { categoryId: true, amount: true },
    });

    // Build a map of categoryId → total spent
    const spentMap = new Map<string, number>();
    for (const expense of expenses) {
      spentMap.set(
        expense.categoryId,
        (spentMap.get(expense.categoryId) ?? 0) + Number(expense.amount),
      );
    }

    // Combine budget and actual spending for each category
    return budgets.map(budget => {
      const budgetAmount = Number(budget.amount);
      const spent        = Math.round((spentMap.get(budget.categoryId) ?? 0) * 100) / 100;
      const remaining    = Math.round((budgetAmount - spent) * 100) / 100;
      const percentUsed  = budgetAmount > 0
        ? Math.round((spent / budgetAmount) * 100)
        : 0;

      return {
        category:   budget.category,
        budget:     budgetAmount,
        spent,
        remaining,
        percentUsed,
      };
    });
  }
}
