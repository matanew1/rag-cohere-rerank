import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { MiddlewareRegistry } from './middlewares/middleware.registry';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const middlewareRegistry = app.get(MiddlewareRegistry);
  await middlewareRegistry.applyAll(app);

  // Get the config service and start the server on the configured port
  const configService = app.get(ConfigService);
  await app.listen(configService.port);

  console.log(`RAG service running on http://localhost:${configService.port}`);
  console.log(`API documentation available at http://localhost:${configService.port}/api/docs`);
}

bootstrap();
