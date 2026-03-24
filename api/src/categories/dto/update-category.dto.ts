/**
 * update-category.dto.ts — Data shape for updating a category
 *
 * All fields are optional — the student can change just the name,
 * just the color, or any combination of the three fields.
 */

import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  icon?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  color?: string;
}
