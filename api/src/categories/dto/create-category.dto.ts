/**
 * create-category.dto.ts — Data shape for creating a new category
 *
 * When a student creates a custom category (e.g. "Gym 🏋️"),
 * they must provide a name, an emoji icon, and a hex color for the charts.
 */

import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  // Category name, e.g. "Gym" or "Rent"
  @IsString()
  @IsNotEmpty()
  name: string;

  // Emoji icon displayed next to the category, e.g. "🏋️"
  @IsString()
  @IsNotEmpty()
  icon: string;

  // Hex color used in charts, e.g. "#F97316"
  @IsString()
  @IsNotEmpty()
  color: string;
}
