import { Injectable, INestApplication } from '@nestjs/common';
import { AppMiddleware } from '../types';

@Injectable()
export class ShutdownHooksMiddleware implements AppMiddleware {
  use(app: INestApplication): void {
    app.enableShutdownHooks();
  }
}
