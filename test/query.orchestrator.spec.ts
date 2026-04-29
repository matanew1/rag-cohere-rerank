import { QueryOrchestrator } from '../src/query/query.orchestrator';
import { Embedder } from '../src/interfaces/embedder.interface';
import { VectorStore } from '../src/interfaces/vector-store.interface';
import { Reranker } from '../src/interfaces/reranker.interface';
import { LLMProvider } from '../src/interfaces/llm.interface';
import { Chunk } from '../src/interfaces/chunk.interface';

const makeChunks = (n: number): Chunk[] =>
  Array.from({ length: n }, (_, i) => ({ id: `${i}`, text: `t${i}`, source: 'f.md', metadata: {} }));

describe('QueryOrchestrator', () => {
  const candidates = makeChunks(20);
  const top5 = candidates.slice(0, 5);

  let embedder: jest.Mocked<Embedder>;
  let vectorStore: jest.Mocked<VectorStore>;
  let reranker: jest.Mocked<Reranker>;
  let llm: jest.Mocked<LLMProvider>;
  let orchestrator: QueryOrchestrator;

  beforeEach(() => {
    embedder = { embed: jest.fn().mockResolvedValue([0.1, 0.2]), embedBatch: jest.fn() };
    vectorStore = { search: jest.fn().mockResolvedValue(candidates), upsert: jest.fn(), healthCheck: jest.fn() };
    reranker = { rerank: jest.fn().mockResolvedValue(top5) };
    llm = { generate: jest.fn().mockResolvedValue('answer') };
    orchestrator = new QueryOrchestrator(embedder, vectorStore, reranker, llm);
  });

  it('always retrieves exactly 20 candidates', async () => {
    await orchestrator.query('q', false);
    expect(vectorStore.search).toHaveBeenCalledWith(expect.any(Array), 20);
  });

  it('calls reranker with 20 candidates when useRerank=true', async () => {
    await orchestrator.query('q', true);
    expect(reranker.rerank).toHaveBeenCalledWith('q', candidates, 5);
  });

  it('skips reranker when useRerank=false', async () => {
    await orchestrator.query('q', false);
    expect(reranker.rerank).not.toHaveBeenCalled();
  });

  it('uses at most 5 chunks without reranking', async () => {
    const res = await orchestrator.query('q', false);
    expect(res.metrics.chunksUsed).toBeLessThanOrEqual(5);
  });

  it('includes rerankLatencyMs only when reranking was used', async () => {
    const withRerank = await orchestrator.query('q', true);
    expect(withRerank.metrics.rerankLatencyMs).toBeDefined();

    const noRerank = await orchestrator.query('q', false);
    expect(noRerank.metrics.rerankLatencyMs).toBeUndefined();
  });

  it('returns unique citations deduped by source', async () => {
    const dupChunks = makeChunks(5).map((c) => ({ ...c, source: 'same.md' }));
    reranker.rerank.mockResolvedValue(dupChunks);
    const res = await orchestrator.query('q', true);
    expect(res.citations).toEqual(['same.md']);
  });
});
