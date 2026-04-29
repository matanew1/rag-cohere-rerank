import { Module } from '@nestjs/common';
import { MiddlewareRegistry } from './middleware.registry';

@Module({
  providers: [MiddlewareRegistry],
  exports: [MiddlewareRegistry],
})
export class MiddlewareModule {}
