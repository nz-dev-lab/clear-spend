/**
 * auth.service.ts — Core authentication business logic
 *
 * This service handles everything related to user identity:
 *   - Registering a new student account
 *   - Logging in and issuing tokens
 *   - Refreshing an expired access token using the refresh token cookie
 *
 * Passwords are never stored in plain text — bcrypt hashes them before saving.
 * JWTs are signed with secret keys from .env so they can't be forged.
 */

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

// Default categories seeded for every new student — matches CLAUDE.md spec
const DEFAULT_CATEGORIES = [
  { name: 'Food',          icon: '🍔', color: '#F97316' },
  { name: 'Transport',     icon: '🚌', color: '#3B82F6' },
  { name: 'Books',         icon: '📚', color: '#8B5CF6' },
  { name: 'Entertainment', icon: '🎮', color: '#EC4899' },
  { name: 'Health',        icon: '💊', color: '#10B981' },
  { name: 'Other',         icon: '📦', color: '#6B7280' },
];

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * Register a new user account.
   * - Checks the email isn't already taken
   * - Hashes the password with bcrypt (10 rounds)
   * - Creates the user in the database
   * - Seeds 6 default expense categories for them
   * - Returns both access and refresh tokens
   */
  async register(dto: RegisterDto) {
    // Check if email is already registered
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    // Hash the password — bcrypt adds a salt automatically, 10 rounds is standard
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create the user record
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
      },
    });

    // Seed default categories so the student can start logging expenses immediately
    await this.prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((cat) => ({ ...cat, userId: user.id })),
    });

    // Issue tokens and return them
    return this.generateTokens(user.id, user.email);
  }

  /**
   * Log in an existing user.
   * - Finds the user by email
   * - Compares the submitted password against the stored hash
   * - Returns both tokens on success
   */
  async login(dto: LoginDto) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Use a generic error message — don't reveal whether the email exists
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare the plain-text password against the stored bcrypt hash
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.email);
  }

  /**
   * Issue a new access token using a valid refresh token.
   * Called automatically by the frontend when the access token expires (401 response).
   */
  async refresh(refreshToken: string) {
    try {
      // Verify the refresh token with its own secret
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      // Issue a new access token only (not a new refresh token)
      const accessToken = this.jwt.sign(
        { sub: payload.sub, email: payload.email },
        {
          secret: this.config.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m',
        },
      );

      return { accessToken };
    } catch {
      // If the refresh token is expired or invalid, force the user to log in again
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Helper — creates and signs both access and refresh tokens for a given user.
   * The payload contains the user's ID (sub) and email.
   */
  private generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    // Access token: short-lived (15 minutes), used for API requests
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m',
    });

    // Refresh token: long-lived (7 days), stored as httpOnly cookie
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return { accessToken, refreshToken };
  }
}
