import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Embedder } from '../interfaces/embedder.interface';

@Injectable()
export class EmbeddingService implements Embedder, OnModuleInit {
  private readonly logger = new Logger(EmbeddingService.name);
  private extractor: ((text: string, opts: object) => Promise<{ data: Float32Array }>) | null = null;

  async onModuleInit(): Promise<void> {
    this.logger.log('Loading BAAI/bge-small-en-v1.5 model (may download on first run)…');
    // Dynamic import required — @xenova/transformers is ESM-only
    const { pipeline } = await import('@xenova/transformers');
    this.extractor = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5') as any;
    this.logger.log('Embedding model ready');
  }

  async embed(text: string): Promise<number[]> {
    if (!this.extractor) throw new Error('Embedder not initialised');
    const output = await this.extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }
}
