/**
 * app.module.ts — Root module of the NestJS application
 *
 * In NestJS, modules are like containers that group related code together.
 * This is the top-level module — it imports everything else the app needs.
 * As we build more features (auth, expenses, budgets), we'll add them here.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // ConfigModule loads our .env file and makes the variables available
    // isGlobal: true means we don't need to import it again in other modules
    ConfigModule.forRoot({ isGlobal: true }),

    // PrismaModule gives the whole app access to the database connection
    PrismaModule,

    // AuthModule handles register, login, logout, and token refresh
    AuthModule,
  ],
})
export class AppModule {}
