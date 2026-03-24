/**
 * jwt-auth.guard.ts — Route protector using JWT
 *
 * This guard is applied to any route that requires the user to be logged in.
 * Just add @UseGuards(JwtAuthGuard) above a controller method and NestJS will
 * automatically check for a valid JWT before allowing the request through.
 *
 * Example usage in a controller:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('me')
 *   getProfile(@Request() req) { return req.user; }
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
