import { Injectable, NestMiddleware, Type } from '@nestjs/common';

export type MiddlewareEntry = Type<NestMiddleware> | NestMiddleware;

@Injectable()
export class MiddlewareRegistry {
  private readonly middlewares: MiddlewareEntry[] = [];

  register(middleware: MiddlewareEntry): void {
    this.middlewares.push(middleware);
  }

  getMiddlewares(): MiddlewareEntry[] {
    return [...this.middlewares];
  }
}
