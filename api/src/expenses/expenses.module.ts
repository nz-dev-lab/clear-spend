/**
 * expenses.module.ts — Bundles the expenses feature
 *
 * ExpensesService is exported so the analytics module (Step 8)
 * can reuse expense queries for generating charts and summaries.
 */

import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
