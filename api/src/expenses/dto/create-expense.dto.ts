/**
 * create-expense.dto.ts — Data shape for logging a new expense
 *
 * When a student adds an expense, they provide:
 *   - how much they spent (amount)
 *   - a short description (e.g. "Lunch at uni cafe")
 *   - when they spent it (date)
 *   - which category it falls under (categoryId)
 */

import { IsString, IsNotEmpty, IsDateString, IsNumberString } from 'class-validator';

export class CreateExpenseDto {
  // Amount as a string to preserve decimal precision (e.g. "12.50")
  // We use IsNumberString because JSON numbers can lose precision for decimals
  @IsNumberString()
  amount: string;

  // Short description of what the money was spent on
  @IsString()
  @IsNotEmpty()
  description: string;

  // ISO 8601 date string, e.g. "2024-03-15T00:00:00.000Z"
  @IsDateString()
  date: string;

  // ID of the category this expense belongs to (e.g. Food, Transport)
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
