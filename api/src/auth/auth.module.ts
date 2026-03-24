/**
 * auth.module.ts — Bundles all auth-related pieces together
 *
 * This module registers:
 *   - PassportModule: enables the @UseGuards(JwtAuthGuard) decorator
 *   - JwtModule: provides the JwtService used to sign/verify tokens
 *   - JwtStrategy: tells Passport how to validate incoming JWTs
 *   - AuthService + AuthController: the business logic and routes
 *
 * JwtAuthGuard is exported so other modules (users, expenses, etc.)
 * can protect their routes without re-configuring anything.
 */

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    PassportModule,
    // JwtModule is configured without a default secret here because
    // AuthService manually passes secrets per token (access vs refresh have different secrets)
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  // Export JwtAuthGuard so any other module can use @UseGuards(JwtAuthGuard)
  exports: [JwtAuthGuard],
})
export class AuthModule {}
