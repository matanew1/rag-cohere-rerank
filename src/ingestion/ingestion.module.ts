import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { DocumentLoaderService } from './document-loader.service';
import { ChunkingModule } from '../chunking/chunking.module';
import { EmbeddingModule } from '../embedding/embedding.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';

@Module({
  imports: [ChunkingModule, EmbeddingModule, VectorStoreModule],
  controllers: [IngestionController],
  providers: [IngestionService, DocumentLoaderService],
})
export class IngestionModule {}
