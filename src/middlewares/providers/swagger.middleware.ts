import { Injectable, INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppMiddleware } from '../types';

@Injectable()
export class SwaggerMiddleware implements AppMiddleware {
  use(app: INestApplication): void {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('RAG Service API')
      .setDescription('API documentation for the RAG service')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }
}
