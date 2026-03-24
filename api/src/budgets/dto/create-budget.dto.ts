/**
 * create-budget.dto.ts — Data shape for setting a budget
 *
 * A budget is a spending limit for one category in one month.
 * For example: "I want to spend no more than $200 on Food in March 2026"
 */

import { IsString, IsNotEmpty, IsNumberString, Matches } from 'class-validator';

export class CreateBudgetDto {
  // The spending limit, e.g. "200.00"
  @IsNumberString()
  amount: string;

  // Month this budget applies to — must be in "YYYY-MM" format, e.g. "2026-03"
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be in YYYY-MM format' })
  month: string;

  // Which category this budget is for
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
