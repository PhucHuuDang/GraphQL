// api/index.js
import { NestFactory } from '@nestjs/core';

let app;

async function bootstrap() {
  try {
    if (!app) {
      console.log('Initializing NestJS app...');

      // ✅ Dynamic import để tránh lỗi ESM
      const { AppModule } = await import('../dist/app.module.js');

      app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log'],
      });

      app.enableCors({
        origin: true,
        credentials: true,
      });

      await app.init();
      console.log('NestJS app initialized successfully');
    }
    return app;
  } catch (error) {
    console.error('Failed to initialize NestJS app:', error);
    throw error;
  }
}

export default async (req, res) => {
  try {
    const application = await bootstrap();
    const server = application.getHttpAdapter().getInstance();
    return server(req, res);
  } catch (error) {
    console.error('Request handler error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};
