import { Chunk } from './chunk.interface';

export interface VectorStore {
  upsert(chunks: Chunk[], embeddings: number[][]): Promise<void>;
  search(vector: number[], k: number): Promise<Chunk[]>;
  healthCheck(): Promise<boolean>;
}
