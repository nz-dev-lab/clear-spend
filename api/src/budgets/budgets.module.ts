/**
 * budgets.module.ts — Bundles the budgets feature
 *
 * BudgetsService is exported so the analytics module can use budget
 * data when calculating budget vs actual comparisons.
 */

import { Module } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [BudgetsController],
  providers: [BudgetsService],
  exports: [BudgetsService],
})
export class BudgetsModule {}
