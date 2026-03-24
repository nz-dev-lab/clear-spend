/**
 * query-analytics.dto.ts — Query param for all analytics endpoints
 *
 * All analytics endpoints accept an optional ?month=YYYY-MM parameter.
 * If not provided, the current month is used as the default.
 */

import { IsOptional, IsString, Matches } from 'class-validator';

export class QueryAnalyticsDto {
  // e.g. "2026-03" for March 2026
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be in YYYY-MM format' })
  month?: string;
}
