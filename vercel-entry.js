const { NestFactory } = require('@nestjs/core');
const path = require('path');

let cachedApp;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  console.log('Current directory:', __dirname);
  console.log(
    'Looking for app.module.js at:',
    path.join(__dirname, 'dist', 'app.module.js'),
  );

  // Use CommonJS require for the compiled NestJS app
  const { AppModule } = require('./dist/app.module.js');

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

module.exports = async (req, res) => {
  try {
    const app = await bootstrap();
    const expressApp = app.getHttpAdapter().getInstance();

    expressApp(req, res);
  } catch (error) {
    console.error('Bootstrap error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};
