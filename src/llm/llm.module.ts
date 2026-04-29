import { Module } from '@nestjs/common';
import { MistralService } from './mistral.service';
import { LLM_PROVIDER } from '../interfaces/injection-tokens';

@Module({
  providers: [
    MistralService,
    { provide: LLM_PROVIDER, useExisting: MistralService },
  ],
  exports: [LLM_PROVIDER],
})
export class LLMModule {}
