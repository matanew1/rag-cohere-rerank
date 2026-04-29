import { Module } from '@nestjs/common';
import { ChromaController } from './chroma.controller';
import { ChromaService } from './chroma.service';
import { VECTOR_STORE } from '../interfaces/injection-tokens';

@Module({
  providers: [
    ChromaService,
    { provide: VECTOR_STORE, useExisting: ChromaService },
  ],
  controllers: [ChromaController],
  exports: [VECTOR_STORE, ChromaService],
})
export class VectorStoreModule {}
