/**
 * users.controller.ts — HTTP routes for user profile
 *
 * Both routes are protected by JwtAuthGuard — you must be logged in to use them.
 *
 *   GET  /users/me  — returns the logged-in student's profile
 *   PATCH /users/me — updates name and/or email
 *
 * @Request() gives us access to req.user which was populated by JwtStrategy
 * after verifying the Bearer token. It contains { userId, email }.
 */

import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // Every route in this controller requires a valid JWT
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * GET /users/me
   * Returns the current user's profile — name, email, account creation date.
   */
  @Get('me')
  getMe(@Request() req) {
    // req.user.userId is set by JwtStrategy.validate() after token verification
    return this.usersService.getMe(req.user.userId);
  }

  /**
   * PATCH /users/me
   * Updates name and/or email. Only the fields sent in the body are changed.
   */
  @Patch('me')
  updateMe(@Request() req, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(req.user.userId, dto);
  }
}
