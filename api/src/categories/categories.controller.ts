/**
 * categories.controller.ts — HTTP routes for category management
 *
 * All routes require a valid JWT (enforced by JwtAuthGuard at the class level).
 *
 *   GET    /categories      — list all categories for the logged-in student
 *   POST   /categories      — create a new category
 *   PATCH  /categories/:id  — update a category by ID
 *   DELETE /categories/:id  — delete a category by ID
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // Protect every route in this controller
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  /** GET /categories — returns all of the student's categories */
  @Get()
  findAll(@Request() req) {
    return this.categoriesService.findAll(req.user.userId);
  }

  /** POST /categories — creates a new category */
  @Post()
  create(@Request() req, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(req.user.userId, dto);
  }

  /** PATCH /categories/:id — updates name, icon, or color */
  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(req.user.userId, id, dto);
  }

  /** DELETE /categories/:id — deletes a category */
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.categoriesService.remove(req.user.userId, id);
  }
}
