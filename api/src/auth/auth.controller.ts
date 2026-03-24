/**
 * auth.controller.ts — HTTP routes for authentication
 *
 * This controller handles the 4 auth endpoints:
 *   POST /auth/register  — create a new account
 *   POST /auth/login     — sign in and get tokens
 *   POST /auth/logout    — clear the refresh token cookie
 *   POST /auth/refresh   — get a new access token using the refresh cookie
 *
 * The refresh token is always stored in an httpOnly cookie (the browser manages it
 * automatically and JavaScript can't read it — this is a security best practice).
 * The access token is returned in the response body for the frontend to store.
 */

import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/register
   * Creates a new student account, seeds default categories,
   * and returns an access token + sets the refresh token as a cookie.
   */
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.register(dto);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  /**
   * POST /auth/login
   * Authenticates an existing user and returns tokens in the same way as register.
   */
  @HttpCode(HttpStatus.OK) // Override default 201 → 200 for login
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(dto);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  /**
   * POST /auth/logout
   * Clears the refresh token cookie — the frontend should also discard the access token.
   */
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    // Clear the cookie by setting it to expire immediately
    res.clearCookie('refresh_token', { httpOnly: true, sameSite: 'lax' });
    return { message: 'Logged out successfully' };
  }

  /**
   * POST /auth/refresh
   * Reads the refresh token from the httpOnly cookie and issues a new access token.
   * The frontend calls this silently when it gets a 401 response.
   */
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Req() req: Request) {
    // The cookie-parser middleware makes cookies available on req.cookies
    const token = req.cookies?.refresh_token;
    if (!token) {
      throw new UnauthorizedException('No refresh token provided');
    }
    return this.authService.refresh(token);
  }

  /**
   * Helper — sets the refresh token as a secure httpOnly cookie.
   * httpOnly means JavaScript on the frontend cannot read this cookie,
   * which protects against XSS attacks.
   */
  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,       // Not accessible via JavaScript — security measure
      sameSite: 'lax',     // Protects against CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
  }
}
