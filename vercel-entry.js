// vercel-entry.js
import { NestFactory } from '@nestjs/core';

let cachedApp;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  const { AppModule } = await import('./dist/app.module.js');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.init();

  cachedApp = app;
  return app;
}

export default async (req, res) => {
  try {
    const app = await bootstrap();
    const expressApp = app.getHttpAdapter().getInstance();

    // Handle the request with Express
    expressApp(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};
