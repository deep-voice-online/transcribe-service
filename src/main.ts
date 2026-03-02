import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  const port = config.getOrThrow<number>('HTTP_PORT')

  await app.listen(port);
  console.log(`Running on ${port}`);
}
bootstrap();
