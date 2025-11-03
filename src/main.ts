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
  });

  app.enableCors({
    // origin: ['https://localhost:3000'],
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  console.log('test', process.env.DATABASE_URL);

  const port = process.env.PORT || 3001;

  await app.listen(port);
  console.log(`🚀 GraphQL server ready at http://localhost:${port}/graphql`);
}
bootstrap();
