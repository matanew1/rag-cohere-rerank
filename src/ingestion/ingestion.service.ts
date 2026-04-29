import { Injectable, Inject } from '@nestjs/common';
import { DocumentLoaderService } from './document-loader.service';
import { ChunkService } from '../chunking/chunk.service';
import { Embedder } from '../interfaces/embedder.interface';
import { VectorStore } from '../interfaces/vector-store.interface';
import { EMBEDDER, VECTOR_STORE } from '../interfaces/injection-tokens';
import { IngestResponseDto } from './dto/ingest-response.dto';

@Injectable()
export class IngestionService {
  constructor(
    private readonly documentLoader: DocumentLoaderService,
    private readonly chunkService: ChunkService,
    @Inject(EMBEDDER) private readonly embedder: Embedder,
    @Inject(VECTOR_STORE) private readonly vectorStore: VectorStore,
  ) {}

  async ingest(dir = 'documents/sample'): Promise<IngestResponseDto> {
    const docs = await this.documentLoader.load(dir);
    let totalChunks = 0;

    for (const doc of docs) {
      const chunks = this.chunkService.chunk(doc.text, doc.source);
      const embeddings = await this.embedder.embedBatch(chunks.map((c) => c.text));
      await this.vectorStore.upsert(chunks, embeddings);
      totalChunks += chunks.length;
    }

    return { documentsProcessed: docs.length, chunksIngested: totalChunks };
  }
}
