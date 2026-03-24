/**
 * analytics.module.ts — Bundles the analytics feature
 *
 * Analytics is read-only — it queries expenses and budgets directly via PrismaService
 * (which is globally available) rather than importing Expenses/Budgets modules.
 */

import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
