/**
 * users.service.ts — Business logic for user profile operations
 *
 * Handles two things:
 *   1. Fetching the current user's profile (name, email, join date)
 *   2. Updating the current user's name or email
 *
 * The userId always comes from the verified JWT — never from the request body.
 * This ensures a user can only ever read or modify their own data.
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Returns the profile of the currently logged-in user.
   * The password field is explicitly excluded — never expose it in a response.
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        // password is intentionally NOT selected — never send it to the client
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Updates the current user's name and/or email.
   * If a new email is provided, we check it isn't already used by another account.
   */
  async updateMe(userId: string, dto: UpdateUserDto) {
    // If they're changing their email, make sure it's not taken by someone else
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      // Allow if it's their own current email, block if it belongs to another user
      if (existing && existing.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    // Update only the fields that were provided (Prisma ignores undefined fields)
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        // password excluded again
      },
    });

    return updated;
  }
}
