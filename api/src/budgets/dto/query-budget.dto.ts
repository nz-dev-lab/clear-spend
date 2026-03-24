/**
 * query-budget.dto.ts — Filter for GET /budgets
 *
 * The only supported filter is month, e.g. GET /budgets?month=2026-03
 * Without a filter, all budgets for the user are returned.
 */

import { IsOptional, IsString, Matches } from 'class-validator';

export class QueryBudgetDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be in YYYY-MM format' })
  month?: string;
}
