import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'GraphQL',
      compact: true,
      showHidden: true,
      timestamp: true,
      colors: true,
    }),
  });

  // Global exception filters
  app.useGlobalFilters(new PrismaExceptionFilter());

  // Global interceptors (auto-transform responses)
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  // Global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.init();

  const port = process.env.PORT || 3001;

  await app.listen(port);
  console.log(`🚀 GraphQL server ready at http://localhost:${port}/graphql`);
}

void bootstrap();
