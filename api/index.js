const { NestFactory } = require('@nestjs/core');

let app;

async function bootstrap() {
  if (app) {
    return app;
  }

  console.log('Initializing NestJS app...');
  console.log('Current directory:', __dirname);

  // Load the compiled NestJS app module
  const { AppModule } = require('../dist/app.module.js');

  app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.init();
  console.log('NestJS app initialized successfully');

  return app;
}

module.exports = async (req, res) => {
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
