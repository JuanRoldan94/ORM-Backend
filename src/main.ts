import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  // RB-1: los DTOs rechazan datos faltantes, de tipo incorrecto o campos que no existen.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaExceptionFilter(httpAdapter));
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
