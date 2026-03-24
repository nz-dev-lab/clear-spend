/**
 * budgets.controller.ts — HTTP routes for budget management
 *
 * All routes require a valid JWT.
 *
 *   GET    /budgets      — list budgets (supports ?month=YYYY-MM filter)
 *   POST   /budgets      — create or update a budget (upsert)
 *   PATCH  /budgets/:id  — update a specific budget's amount by ID
 *   DELETE /budgets/:id  — delete a budget
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
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { QueryBudgetDto } from './dto/query-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  /** GET /budgets — list all budgets, optionally filtered by month */
  @Get()
  findAll(@Request() req, @Query() query: QueryBudgetDto) {
    return this.budgetsService.findAll(req.user.userId, query);
  }

  /** POST /budgets — create a new budget or update if one already exists */
  @Post()
  upsert(@Request() req, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.upsert(req.user.userId, dto);
  }

  /** PATCH /budgets/:id — update a specific budget's amount */
  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateBudgetDto) {
    return this.budgetsService.update(req.user.userId, id, dto);
  }

  /** DELETE /budgets/:id — delete a budget */
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.budgetsService.remove(req.user.userId, id);
  }
}
