/**
 * query-expense.dto.ts — Filters and pagination for GET /expenses
 *
 * All query params are optional. Example URL:
 *   GET /expenses?month=2024-03&categoryId=abc123&page=2&limit=10
 *
 * month      — show only expenses from this month (format: "YYYY-MM")
 * categoryId — show only expenses in this category
 * page       — which page of results to return (default: 1)
 * limit      — how many results per page (default: 10)
 */

import { IsOptional, IsString, IsNumberString, Matches } from 'class-validator';

export class QueryExpenseDto {
  // Month filter in "YYYY-MM" format, e.g. "2024-03"
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be in YYYY-MM format' })
  month?: string;

  // Filter by a specific category ID
  @IsOptional()
  @IsString()
  categoryId?: string;

  // Page number for pagination (comes in as a string from query params)
  @IsOptional()
  @IsNumberString()
  page?: string;

  // Number of items per page
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
