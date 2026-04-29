import { Injectable, Inject } from '@nestjs/common';
import { Embedder } from '../interfaces/embedder.interface';
import { VectorStore } from '../interfaces/vector-store.interface';
import { Reranker } from '../interfaces/reranker.interface';
import { LLMProvider } from '../interfaces/llm.interface';
import { EMBEDDER, VECTOR_STORE, RERANKER, LLM_PROVIDER } from '../interfaces/injection-tokens';
import { QueryResponseDto } from './dto/query-response.dto';

const RETRIEVAL_K = 20;
const FINAL_K = 5;

@Injectable()
export class QueryOrchestrator {
  constructor(
    @Inject(EMBEDDER) private readonly embedder: Embedder,
    @Inject(VECTOR_STORE) private readonly vectorStore: VectorStore,
    @Inject(RERANKER) private readonly reranker: Reranker,
    @Inject(LLM_PROVIDER) private readonly llm: LLMProvider,
  ) {}

  async query(question: string, useRerank: boolean): Promise<QueryResponseDto> {
    const start = Date.now();

    const queryVector = await this.embedder.embed(question);
    const candidates = await this.vectorStore.search(queryVector, RETRIEVAL_K);

    let rerankLatencyMs: number | undefined;
    let finalChunks = candidates;

    if (useRerank) {
      const rerankStart = Date.now();
      finalChunks = await this.reranker.rerank(question, candidates, FINAL_K);
      rerankLatencyMs = Date.now() - rerankStart;
    } else {
      finalChunks = candidates.slice(0, FINAL_K);
    }

    const answer = await this.llm.generate(question, finalChunks);

    return {
      answer,
      citations: [...new Set(finalChunks.map((c) => c.source))],
      metrics: {
        totalLatencyMs: Date.now() - start,
        rerankLatencyMs,
        chunksRetrieved: candidates.length,
        chunksUsed: finalChunks.length,
      },
    };
  }
}
