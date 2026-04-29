import { Inject, Injectable, INestApplication } from '@nestjs/common';
import { APP_MIDDLEWARES } from './middleware.tokens';
import { AppMiddleware } from './types';

@Injectable()
export class MiddlewareRegistry {
  constructor(@Inject(APP_MIDDLEWARES) private readonly middlewares: AppMiddleware[]) {}

  async applyAll(app: INestApplication): Promise<void> {
    for (const middleware of this.middlewares) {
      await middleware.use(app);
    }
  }

  getMiddlewares(): AppMiddleware[] {
    return [...this.middlewares];
  }
}
