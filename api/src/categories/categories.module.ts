/**
 * categories.module.ts — Bundles the categories feature
 *
 * Imports AuthModule so JwtAuthGuard is available to protect the routes.
 * CategoriesService is exported so future modules (e.g. expenses) can
 * reuse category lookups without duplicating logic.
 */

import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
