import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ChromaClient, Collection } from 'chromadb';
import { ConfigService } from '../config/config.service';
import { Chunk } from '../interfaces/chunk.interface';
import { VectorStore } from '../interfaces/vector-store.interface';

@Injectable()
export class ChromaService implements VectorStore, OnModuleInit {
  private readonly logger = new Logger(ChromaService.name);
  private client!: ChromaClient;
  private collection!: Collection;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    this.client = new ChromaClient({ path: this.config.chromaUrl });
    this.collection = await this.client.getOrCreateCollection({
      name: this.config.collectionName,
      metadata: { 'hnsw:space': 'cosine' },
    });
    this.logger.log(`Connected to Chroma — collection "${this.config.collectionName}"`);
  }

  async upsert(chunks: Chunk[], embeddings: number[][]): Promise<void> {
    await this.collection.upsert({
      ids: chunks.map((c) => c.id),
      embeddings,
      documents: chunks.map((c) => c.text),
      metadatas: chunks.map((c) => ({ source: c.source, ...c.metadata })),
    });
  }

  async search(vector: number[], k: number): Promise<Chunk[]> {
    const results = await this.collection.query({
      queryEmbeddings: [vector],
      nResults: k,
    });

    return (results.ids[0] ?? []).map((id, i) => ({
      id,
      text: results.documents[0][i] ?? '',
      source: String((results.metadatas[0][i] as Record<string, unknown>)?.source ?? ''),
      metadata: (results.metadatas[0][i] as Record<string, unknown>) ?? {},
    }));
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.heartbeat();
      return true;
    } catch {
      return false;
    }
  }
}
