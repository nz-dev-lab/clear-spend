/**
 * main.ts — Entry point of the application
 *
 * This is the first file that runs when the server starts.
 * It creates the NestJS app, applies global settings, and starts listening for requests.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create the NestJS application using the root AppModule
  const app = await NestFactory.create(AppModule);

  // Enable cookie parsing so we can read httpOnly cookies (used for refresh tokens)
  app.use(cookieParser());

  // Apply global validation — automatically checks incoming request data against our DTO rules
  // whitelist: strips any extra fields not defined in the DTO
  // transform: converts plain objects to DTO class instances
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Allow the frontend (running on port 5173) to make requests to this API
  // credentials: true is needed so cookies are sent along with requests
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Start the server on the port defined in .env, defaulting to 3000
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
