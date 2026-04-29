import { Module } from '@nestjs/common';
import { QueryController } from './query.controller';
import { QueryOrchestrator } from './query.orchestrator';
import { EmbeddingModule } from '../embedding/embedding.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';
import { RerankModule } from '../rerank/rerank.module';
import { LLMModule } from '../llm/llm.module';

@Module({
  imports: [EmbeddingModule, VectorStoreModule, RerankModule, LLMModule],
  controllers: [QueryController],
  providers: [QueryOrchestrator],
  exports: [QueryOrchestrator],
})
export class QueryModule {}
