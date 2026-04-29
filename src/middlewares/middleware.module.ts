import { Module } from '@nestjs/common';
import { CorsMiddleware } from './providers/cors.middleware';
import { GlobalPrefixMiddleware } from './providers/global-prefix.middleware';
import { ShutdownHooksMiddleware } from './providers/shutdown-hooks.middleware';
import { SwaggerMiddleware } from './providers/swagger.middleware';
import { ValidationPipeMiddleware } from './providers/validation-pipe.middleware';
import { MiddlewareRegistry } from './middleware.registry';
import { APP_MIDDLEWARES } from './middleware.tokens';
import { AppMiddleware } from './types';

const appMiddlewareProviders = [
  CorsMiddleware,
  ValidationPipeMiddleware,
  GlobalPrefixMiddleware,
  SwaggerMiddleware,
  ShutdownHooksMiddleware,
];

@Module({
  providers: [
    ...appMiddlewareProviders,
    {
      provide: APP_MIDDLEWARES,
      useFactory: (...middlewares: AppMiddleware[]): AppMiddleware[] => middlewares,
      inject: appMiddlewareProviders,
    },
    MiddlewareRegistry,
  ],
  exports: [MiddlewareRegistry],
})
export class MiddlewareModule {}
