/**
 * update-budget.dto.ts — Data shape for updating a budget
 *
 * Only the amount can be updated after creation.
 * Month and category are fixed — they identify the budget record.
 */

import { IsNumberString } from 'class-validator';

export class UpdateBudgetDto {
  // New spending limit, e.g. "250.00"
  @IsNumberString()
  amount: string;
}
