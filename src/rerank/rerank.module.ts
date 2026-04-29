import { Module } from '@nestjs/common';
import { CohereClient } from 'cohere-ai';
import { CohereRerankService } from './cohere-rerank.service';
import { ConfigService } from '../config/config.service';
import { RERANKER } from '../interfaces/injection-tokens';

@Module({
  providers: [
    {
      provide: 'COHERE_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => new CohereClient({ token: config.cohereApiKey }),
    },
    CohereRerankService,
    { provide: RERANKER, useExisting: CohereRerankService },
  ],
  exports: [RERANKER],
})
export class RerankModule {}
