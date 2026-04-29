import { Module } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { EMBEDDER } from '../interfaces/injection-tokens';

@Module({
  providers: [
    EmbeddingService,
    { provide: EMBEDDER, useExisting: EmbeddingService },
  ],
  exports: [EMBEDDER, EmbeddingService],
})
export class EmbeddingModule {}
