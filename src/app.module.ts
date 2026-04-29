import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from './config/config.module';
import { ChunkingModule } from './chunking/chunking.module';
import { EmbeddingModule } from './embedding/embedding.module';
import { VectorStoreModule } from './vector-store/vector-store.module';
import { RerankModule } from './rerank/rerank.module';
import { LLMModule } from './llm/llm.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { QueryModule } from './query/query.module';
import { MiddlewareModule } from './middlewares/middleware.module';

@Module({
  imports: [
    ConfigModule,
    ChunkingModule,
    EmbeddingModule,
    VectorStoreModule,
    RerankModule,
    LLMModule,
    IngestionModule,
    QueryModule,
    MiddlewareModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
