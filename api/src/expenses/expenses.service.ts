/**
 * expenses.service.ts — Business logic for expense tracking
 *
 * This is the core feature of the app — students log their spending here.
 *
 * Key behaviours:
 *   - All queries are scoped to the logged-in user (userId from JWT)
 *   - GET supports filtering by month and/or category, with pagination
 *   - Amounts are stored as Prisma Decimal but serialized as strings in responses
 *   - The category name/icon is included in each expense response (useful for UI)
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Returns a paginated, optionally filtered list of expenses for the current user.
   *
   * Filters:
   *   - month: "YYYY-MM" — matches expenses whose date falls within that calendar month
   *   - categoryId: only expenses in that category
   *
   * Pagination:
   *   - page 1 = items 1-10, page 2 = items 11-20, etc.
   *   - Response includes total count so the frontend can render page controls
   */
  async findAll(userId: string, query: QueryExpenseDto) {
    const page  = parseInt(query.page  ?? '1',  10);
    const limit = parseInt(query.limit ?? '10', 10);
    const skip  = (page - 1) * limit; // how many records to skip for this page

    // Build the filter object — only add conditions for params that were provided
    const where: any = { userId };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.month) {
      // Convert "YYYY-MM" into a date range covering the full calendar month
      const [year, month] = query.month.split('-').map(Number);
      where.date = {
        gte: new Date(year, month - 1, 1),           // first day of month
        lt:  new Date(year, month, 1),               // first day of NEXT month
      };
    }

    // Run both queries in parallel — total count for pagination + the page of data
    const [total, data] = await Promise.all([
      this.prisma.expense.count({ where }),
      this.prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' }, // most recent expenses first
        include: {
          // Include category name and icon so the frontend doesn't need a second request
          category: { select: { id: true, name: true, icon: true, color: true } },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,          // total number of matching expenses
        page,           // current page number
        limit,          // items per page
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Logs a new expense for the current user.
   * The category must exist (Prisma will throw if categoryId is invalid).
   */
  create(userId: string, dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        amount:      dto.amount,
        description: dto.description,
        date:        new Date(dto.date),
        categoryId:  dto.categoryId,
        userId,       // always from the JWT, never from the request body
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    });
  }

  /**
   * Updates an existing expense.
   * Verifies ownership before making any changes.
   */
  async update(userId: string, expenseId: string, dto: UpdateExpenseDto) {
    await this.findOneOrFail(userId, expenseId);

    return this.prisma.expense.update({
      where: { id: expenseId },
      data: {
        ...dto,
        // Convert date string to Date object if provided
        date: dto.date ? new Date(dto.date) : undefined,
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    });
  }

  /**
   * Deletes an expense.
   * Verifies ownership before deleting.
   */
  async remove(userId: string, expenseId: string) {
    await this.findOneOrFail(userId, expenseId);
    await this.prisma.expense.delete({ where: { id: expenseId } });
    return { message: 'Expense deleted' };
  }

  /**
   * Helper — finds an expense by ID and confirms it belongs to this user.
   * Throws 404 if not found, 403 if it belongs to someone else.
   */
  private async findOneOrFail(userId: string, expenseId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (expense.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return expense;
  }
}
