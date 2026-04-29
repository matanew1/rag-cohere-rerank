import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ChromaClient, Collection, GetResponse, IncludeEnum, Metadata } from 'chromadb';
import { ConfigService } from '../config/config.service';
import { Chunk } from '../interfaces/chunk.interface';
import { VectorStore } from '../interfaces/vector-store.interface';
import { ChromaPeekResponseDto } from './dto/chroma-peek.dto';
import { ChromaRecordDto } from './dto/chroma-record.dto';

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

  async peek(limit = 10, includeEmbeddings = false): Promise<ChromaPeekResponseDto> {
    const [count, results] = await Promise.all([
      this.collection.count(),
      includeEmbeddings
        ? this.collection.get({
            limit,
            include: [IncludeEnum.Documents, IncludeEnum.Metadatas, IncludeEnum.Embeddings],
          })
        : this.collection.peek({ limit }),
    ]);

    return {
      collection: this.config.collectionName,
      count,
      records: (results.ids ?? []).map((id, i) => this.toChromaRecord(results, id, i, includeEmbeddings)),
    };
  }

  private toChromaRecord(
    results: GetResponse,
    id: string,
    index: number,
    includeEmbedding: boolean,
  ): ChromaRecordDto {
    const metadata = (results.metadatas?.[index] ?? {}) as Metadata;

    return {
      id,
      text: results.documents?.[index] ?? '',
      source: String(metadata.source ?? ''),
      metadata,
      ...(includeEmbedding ? { embedding: results.embeddings?.[index] ?? [] } : {}),
    };
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
