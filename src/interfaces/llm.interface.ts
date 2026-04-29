import { Chunk } from './chunk.interface';

export interface LLMProvider {
  generate(question: string, chunks: Chunk[]): Promise<string>;
}
