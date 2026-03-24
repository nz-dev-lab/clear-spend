/**
 * expenses.controller.ts — HTTP routes for expense logging
 *
 * All routes require a valid JWT (JwtAuthGuard applied at class level).
 *
 *   GET    /expenses        — list expenses (supports ?month, ?categoryId, ?page, ?limit)
 *   POST   /expenses        — log a new expense
 *   PATCH  /expenses/:id   — edit an existing expense
 *   DELETE /expenses/:id   — delete an expense
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  /**
   * GET /expenses
   * Supports optional query params: ?month=2024-03&categoryId=xxx&page=1&limit=10
   */
  @Get()
  findAll(@Request() req, @Query() query: QueryExpenseDto) {
    return this.expensesService.findAll(req.user.userId, query);
  }

  /** POST /expenses — log a new expense */
  @Post()
  create(@Request() req, @Body() dto: CreateExpenseDto) {
    return this.expensesService.create(req.user.userId, dto);
  }

  /** PATCH /expenses/:id — edit an existing expense */
  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expensesService.update(req.user.userId, id, dto);
  }

  /** DELETE /expenses/:id — remove an expense */
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.expensesService.remove(req.user.userId, id);
  }
}
