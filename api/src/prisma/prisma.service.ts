/**
 * prisma.service.ts — Database connection service
 *
 * Prisma is the tool we use to talk to the PostgreSQL database.
 * Instead of writing raw SQL queries, we use Prisma's clean TypeScript methods
 * (e.g. prisma.user.findMany(), prisma.expense.create()).
 *
 * This service wraps the Prisma client as a singleton — meaning only one
 * database connection is shared across the entire app, which is efficient.
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Called automatically when the app starts — opens the database connection
  async onModuleInit() {
    await this.$connect();
  }

  // Called automatically when the app shuts down — closes the connection cleanly
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
