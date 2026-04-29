import { Module } from '@nestjs/common';
import { ChromaService } from './chroma.service';
import { VECTOR_STORE } from '../interfaces/injection-tokens';

@Module({
  providers: [
    ChromaService,
    { provide: VECTOR_STORE, useExisting: ChromaService },
  ],
  exports: [VECTOR_STORE, ChromaService],
})
export class VectorStoreModule {}
