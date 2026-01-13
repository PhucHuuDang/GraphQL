// api/index.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { NestFactory } = require('@nestjs/core');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { AppModule } = require('../dist/app.module');

let app;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: true,
      credentials: true,
    });

    await app.init();
  }
  return app;
}

module.exports = async (req, res) => {
  const application = await bootstrap();
  const server = application.getHttpAdapter().getInstance();
  return server(req, res);
};
