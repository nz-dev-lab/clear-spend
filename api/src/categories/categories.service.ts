/**
 * categories.service.ts — Business logic for category management
 *
 * Students can organise their spending into categories (e.g. Food, Transport).
 * Six default categories are seeded automatically on registration.
 * This service lets them view, create, edit, and delete categories.
 *
 * IMPORTANT: Every query filters by userId from the JWT — students can only
 * ever see and modify their own categories, never another user's.
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Returns all categories belonging to the logged-in student,
   * sorted by creation date (oldest first — so default categories appear at the top).
   */
  findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Creates a new custom category for the logged-in student.
   * The userId is taken from the JWT — the client never sends it.
   */
  create(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        ...dto,
        userId, // Always set from the verified token, never from request body
      },
    });
  }

  /**
   * Updates a category's name, icon, or color.
   * First checks the category exists and belongs to this user before updating.
   */
  async update(userId: string, categoryId: string, dto: UpdateCategoryDto) {
    await this.findOneOrFail(userId, categoryId);

    return this.prisma.category.update({
      where: { id: categoryId },
      data: dto,
    });
  }

  /**
   * Deletes a category.
   * Note: any expenses linked to this category will still exist but lose their
   * category reference — handle with care in a real production app.
   */
  async remove(userId: string, categoryId: string) {
    await this.findOneOrFail(userId, categoryId);

    await this.prisma.category.delete({ where: { id: categoryId } });
    return { message: 'Category deleted' };
  }

  /**
   * Helper — finds a category by ID and verifies it belongs to this user.
   * Throws 404 if not found, 403 if it belongs to someone else.
   * Used internally before any update or delete operation.
   */
  private async findOneOrFail(userId: string, categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Prevent a user from modifying another user's categories
    if (category.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return category;
  }
}
