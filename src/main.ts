import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'GraphQL',
      compact: true,
      showHidden: true,
      timestamp: true,
      colors: true,
    }),

    // bufferLogs: true,

    bodyParser: false,
  });

  app.enableCors({
    // ⚠️ CRITICAL: Specify exact origin for OAuth state cookies to work
    // origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true, // Required for cookies
  });

  const port = process.env.PORT || 3001;

  await app.listen(port);
  console.log(`🚀 GraphQL server ready at http://localhost:${port}/graphql`);
}
bootstrap();
