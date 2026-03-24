/**
 * budgets.service.ts — Business logic for budget management
 *
 * Students set a monthly spending limit per category (e.g. $200 for Food in March).
 * The database enforces that there's only ONE budget per user/category/month combination.
 *
 * Key design decision — POST uses "upsert":
 *   If a budget for that user + category + month already exists, it gets updated.
 *   If it doesn't exist, a new one is created.
 *   This makes the frontend simpler — it doesn't need to check if a budget exists first.
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { QueryBudgetDto } from './dto/query-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Returns all budgets for the current user, optionally filtered by month.
   * Includes the category name, icon, and color — useful for the Budgets page UI.
   */
  findAll(userId: string, query: QueryBudgetDto) {
    return this.prisma.budget.findMany({
      where: {
        userId,
        // Only add month filter if it was provided
        ...(query.month ? { month: query.month } : {}),
      },
      orderBy: { createdAt: 'asc' },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    });
  }

  /**
   * Creates a budget — or updates it if one already exists for this user/category/month.
   *
   * Uses Prisma's upsert:
   *   - "where" identifies the existing record using the unique constraint
   *   - "create" is used if no record exists
   *   - "update" is used if a record already exists
   */
  upsert(userId: string, dto: CreateBudgetDto) {
    return this.prisma.budget.upsert({
      where: {
        // The unique constraint on the Budget model: one per user + category + month
        userId_categoryId_month: {
          userId,
          categoryId: dto.categoryId,
          month: dto.month,
        },
      },
      create: {
        amount:     dto.amount,
        month:      dto.month,
        categoryId: dto.categoryId,
        userId,
      },
      update: {
        // If budget already exists, just update the amount
        amount: dto.amount,
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    });
  }

  /**
   * Updates the amount of an existing budget by its ID.
   * Verifies the budget belongs to the current user before updating.
   */
  async update(userId: string, budgetId: string, dto: UpdateBudgetDto) {
    await this.findOneOrFail(userId, budgetId);

    return this.prisma.budget.update({
      where: { id: budgetId },
      data: { amount: dto.amount },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    });
  }

  /**
   * Deletes a budget by its ID.
   * Verifies ownership first.
   */
  async remove(userId: string, budgetId: string) {
    await this.findOneOrFail(userId, budgetId);
    await this.prisma.budget.delete({ where: { id: budgetId } });
    return { message: 'Budget deleted' };
  }

  /**
   * Helper — looks up a budget and checks it belongs to this user.
   * Throws 404 if not found, 403 if it's someone else's.
   */
  private async findOneOrFail(userId: string, budgetId: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    if (budget.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return budget;
  }
}
