import { Injectable, INestApplication, ValidationPipe } from '@nestjs/common';
import { AppMiddleware } from '../types';

@Injectable()
export class ValidationPipeMiddleware implements AppMiddleware {
  use(app: INestApplication): void {
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  }
}
