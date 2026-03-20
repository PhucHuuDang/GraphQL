import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@nestjs/config';

import helmet from 'helmet';

import { GraphQLExceptionFilter } from './common/filters/graphql-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'GraphQL',
      compact: true,
      showHidden: true,
      timestamp: true,
      colors: true,
    }),
  });

  const configService: ConfigService<unknown, boolean> = app.get(ConfigService);
  const isProduction = configService.get('app.isProduction');

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
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

  // Validate required environment variables at startup
  const requiredEnvVars = ['DATABASE_URL', 'BETTER_AUTH_SECRET', 'BETTER_AUTH_URL'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      logger.warn(`Missing required environment variable: ${envVar}`);
    }
  }

  // Enable graceful shutdown hooks (important for containers / Railway)
  app.enableShutdownHooks();

  // CORS configuration with environment-based origins
  const configOrigins = configService.get<string[]>('cors.allowedOrigins') || [];
  const allowedOrigins = [...new Set([...configOrigins, 'http://localhost:3000'])];
  app.enableCors({
    origin: (
      requestOrigin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!isProduction) {
        return callback(null, true);
      }
      if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
        return callback(null, true);
      }
      console.warn(`[CORS block] Origin missing from Railway variable: ${requestOrigin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.init();

  const port = configService.get<number>('app.port') || 3001;

  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 GraphQL server ready at http://0.0.0.0:${port}/graphql`);
  logger.log(`💚 Health check available at http://0.0.0.0:${port}/health`);
}

void bootstrap();
