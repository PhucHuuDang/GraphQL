import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@nestjs/config';

import helmet from 'helmet';

import { GraphQLExceptionFilter } from './common/filters/graphql-exception.filter';
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

  const configService = app.get(ConfigService);
  const isProduction = configService.get('app.isProduction');

  // Security headers with Helmet.js
  app.use(
    helmet({
      // Disable for GraphQL Playground/GraphiQL in development
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginEmbedderPolicy: isProduction,
    }),
  );

  // Global exception filters (order matters: most specific first)
  app.useGlobalFilters(new GraphQLExceptionFilter(), new PrismaExceptionFilter());

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

  // CORS configuration with environment-based origins
  const allowedOrigins = configService.get<string[]>('cors.allowedOrigins') || [
    'http://localhost:3000',
  ];
  app.enableCors({
    origin: isProduction ? allowedOrigins : true,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  await app.init();

  const port = configService.get<number>('app.port') || 3001;

  await app.listen(Number(port), '0.0.0.0');

  console.log(`🚀 GraphQL server ready at http://0.0.0.0:${port}/graphql`);
  console.log(`💚 Health check available at http://0.0.0.0:${port}/health`);
}

void bootstrap();
