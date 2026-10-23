import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';
import { type AppConfigService } from './config/env.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<AppConfigService>(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pulse API')
    .setDescription('API uptime & performance monitoring service with Telegram bot.')
    .setVersion('0.1.0')
    .build();
  SwaggerModule.setup('docs', app, () => SwaggerModule.createDocument(app, swaggerConfig));

  await app.listen(config.get('PORT', { infer: true }));
}
await bootstrap();
