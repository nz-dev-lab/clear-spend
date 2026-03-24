/**
 * update-expense.dto.ts — Data shape for editing an existing expense
 *
 * All fields are optional — only the fields sent will be updated.
 */

import { IsString, IsOptional, IsDateString, IsNumberString, IsNotEmpty } from 'class-validator';

export class UpdateExpenseDto {
  @IsOptional()
  @IsNumberString()
  amount?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  categoryId?: string;
}
