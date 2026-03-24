/**
 * login.dto.ts — Data shape for the login request
 *
 * Validates that the incoming login request has both an email and a password.
 * If either is missing or malformed, NestJS rejects the request before it
 * even reaches our service logic.
 */

import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
