import { Injectable, Inject, Logger } from '@nestjs/common';
import { Chunk } from '../interfaces/chunk.interface';
import { Reranker } from '../interfaces/reranker.interface';

export interface CohereClientLike {
  rerank(params: {
    model: string;
    query: string;
    documents: string[];
    topN: number;
  }): Promise<{ results: Array<{ index: number; relevanceScore: number }> }>;
}

@Injectable()
export class CohereRerankService implements Reranker {
  private readonly logger = new Logger(CohereRerankService.name);

  constructor(@Inject('COHERE_CLIENT') private readonly client: CohereClientLike) {}

  async rerank(query: string, chunks: Chunk[], topN: number): Promise<Chunk[]> {
    try {
      const response = await this.client.rerank({
        model: 'rerank-v3.5',
        query,
        documents: chunks.map((c) => c.text),
        topN,
      });
      return response.results.map((r) => chunks[r.index]);
    } catch (err) {
      // Graceful degradation — return top-N by vector similarity order
      this.logger.warn(`Rerank failed, falling back to vector order: ${(err as Error).message}`);
      return chunks.slice(0, topN);
    }
  }
}
