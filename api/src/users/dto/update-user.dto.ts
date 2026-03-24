/**
 * update-user.dto.ts — Data shape for updating a user's profile
 *
 * Both fields are optional — the student can update just their name,
 * just their email, or both at the same time.
 * The ? marks mean "not required".
 */

import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  // New display name — optional
  @IsOptional()
  @IsString()
  name?: string;

  // New email address — optional, but must be valid format if provided
  @IsOptional()
  @IsEmail()
  email?: string;
}
