import { Chunk } from './chunk.interface';

export interface Reranker {
  rerank(query: string, chunks: Chunk[], topN: number): Promise<Chunk[]>;
}
