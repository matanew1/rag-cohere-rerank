import { Injectable, INestApplication } from '@nestjs/common';
import { AppMiddleware } from '../types';

@Injectable()
export class GlobalPrefixMiddleware implements AppMiddleware {
  use(app: INestApplication): void {
    app.setGlobalPrefix('api');
  }
}
