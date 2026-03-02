import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, // Разрешить все источники (можно указать конкретные домены)
    credentials: true, // Разрешить отправку cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  const config = app.get(ConfigService);

  const port = config.getOrThrow<number>('HTTP_PORT');

  await app.listen(port);
  console.log(`Running on ${port}`);
}

bootstrap();
