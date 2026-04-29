import { INestApplication } from '@nestjs/common';

export interface AppMiddleware {
  use(app: INestApplication): void | Promise<void>;
}
