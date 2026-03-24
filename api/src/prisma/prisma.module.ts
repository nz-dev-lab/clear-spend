/**
 * prisma.module.ts — Makes the database service available app-wide
 *
 * This module registers PrismaService and exports it so any other module
 * (auth, expenses, budgets, etc.) can inject and use it without extra setup.
 *
 * @Global() means we only need to import this module once (in AppModule)
 * and it's automatically available everywhere — no need to re-import it.
 */

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService], // Register PrismaService so NestJS can manage it
  exports: [PrismaService],   // Export it so other modules can use it
})
export class PrismaModule {}
