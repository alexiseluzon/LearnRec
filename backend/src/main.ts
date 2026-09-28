import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origins = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim());
  
  if (!origins?.length && process.env.NODE_ENV === 'production') {
    throw new Error('CORS_ORIGIN must be set in production');
  }

  app.enableCors({
    origin: origins ?? '*',
    credentials: true,
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties from incoming DTOs
      forbidNonWhitelisted: true, // reject requests with extra properties
      transform: true, // auto-transform payloads to DTO instances
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
