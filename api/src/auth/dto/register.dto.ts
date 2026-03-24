/**
 * register.dto.ts — Data shape for the registration request
 *
 * A DTO (Data Transfer Object) defines what fields are expected in a request body.
 * class-validator decorators automatically validate the incoming data and return
 * clear error messages if something is missing or wrong — no manual checking needed.
 */

import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  // Must be a valid email format, e.g. student@uni.ac.nz
  @IsEmail()
  email: string;

  // The student's display name — must be a non-empty string
  @IsString()
  name: string;

  // Password must be at least 6 characters long
  @IsString()
  @MinLength(6)
  password: string;
}
