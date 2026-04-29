import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all origins and methods
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // Use global validation pipe with transformation and whitelist options 
  // - this will automatically transform payloads to the expected types 
  // and strip out any properties that are not defined in the DTOs
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Use global prefix for all routes
  app.setGlobalPrefix('api');

  // Use SwaggerUI for API documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('RAG Service API')
    .setDescription('API documentation for the RAG service')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Enable shutdown hooks - 
  // this allows the app to gracefully shut down when receiving termination signals
  app.enableShutdownHooks();

  // Get the config service and start the server on the configured port
  const configService = app.get(ConfigService);
  await app.listen(configService.port);

  console.log(`RAG service running on http://localhost:${configService.port}`);
  console.log(`API documentation available at http://localhost:${configService.port}/api/docs`);
}

bootstrap();
