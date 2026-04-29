import { Injectable, INestApplication } from '@nestjs/common';
import { AppMiddleware } from '../types';

@Injectable()
export class CorsMiddleware implements AppMiddleware {
  use(app: INestApplication): void {
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    });
  }
}
