/**
 * users.module.ts — Bundles the users feature together
 *
 * Registers UsersService and UsersController.
 * AuthModule is imported so JwtAuthGuard is available to protect the routes.
 */

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // Gives us access to JwtAuthGuard
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
