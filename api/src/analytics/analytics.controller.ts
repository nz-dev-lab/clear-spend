/**
 * analytics.controller.ts — HTTP routes for charts and summary data
 *
 * All routes are read-only (GET) and require a valid JWT.
 * All accept an optional ?month=YYYY-MM query param.
 *
 *   GET /analytics/monthly-summary    — dashboard summary cards
 *   GET /analytics/spend-by-category  — donut chart data
 *   GET /analytics/daily-trend        — line chart data
 *   GET /analytics/budget-vs-actual   — bar chart data
 */

import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { QueryAnalyticsDto } from './dto/query-analytics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /** GET /analytics/monthly-summary — total spent, budget, % used */
  @Get('monthly-summary')
  monthlySummary(@Request() req, @Query() query: QueryAnalyticsDto) {
    return this.analyticsService.monthlySummary(req.user.userId, query.month);
  }

  /** GET /analytics/spend-by-category — per category totals for donut chart */
  @Get('spend-by-category')
  spendByCategory(@Request() req, @Query() query: QueryAnalyticsDto) {
    return this.analyticsService.spendByCategory(req.user.userId, query.month);
  }

  /** GET /analytics/daily-trend — daily totals for line chart */
  @Get('daily-trend')
  dailyTrend(@Request() req, @Query() query: QueryAnalyticsDto) {
    return this.analyticsService.dailyTrend(req.user.userId, query.month);
  }

  /** GET /analytics/budget-vs-actual — budget vs spent per category for bar chart */
  @Get('budget-vs-actual')
  budgetVsActual(@Request() req, @Query() query: QueryAnalyticsDto) {
    return this.analyticsService.budgetVsActual(req.user.userId, query.month);
  }
}
