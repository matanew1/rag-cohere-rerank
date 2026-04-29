import { QueryResponseDto } from '../src/query/dto/query-response.dto';
import { ReportService } from '../src/reports/report.service';

const response = (
  answer: string,
  citations: string[],
  totalLatencyMs: number,
  rerankLatencyMs?: number,
): QueryResponseDto => ({
  answer,
  citations,
  metrics: {
    totalLatencyMs,
    rerankLatencyMs,
    chunksRetrieved: 20,
    chunksUsed: 5,
  },
});

describe('ReportService', () => {
  it('renders a compact results table with summary metrics', () => {
    const service = new ReportService();

    const report = service.generate([
      {
        question: 'What is RAG?',
        withRerank: response('RAG retrieves relevant context before generation.', ['rag.md'], 1200, 120),
        withoutRerank: response('RAG retrieves context and then generates answers.', ['overview.md'], 1000),
      },
      {
        question: 'Why rerank?',
        withRerank: response('Reranking improves precision by reordering candidate chunks.', ['rerank.md'], 1400, 180),
        withoutRerank: response('Reranking changes candidate order.', ['rerank.md'], 1100),
      },
      {
        question: 'What are embeddings?',
        withRerank: response('Embeddings encode semantic meaning for search.', ['embeddings.md'], 1300, 160),
        withoutRerank: response('Embeddings encode meaning for retrieval.', ['embeddings.md'], 1150),
      },
    ]);

    expect(report).toContain('## Summary');
    expect(report).toContain('| Questions | p50 rerank | Avg total delta | Retrieved -> used |');
    expect(report).toContain('| 3 | 160ms | +217ms | 20 -> 5 |');
    expect(report).toContain('## Takeaways');
    expect(report).toContain('2/3 questions cited the same source set');
    expect(report).toContain('The rerank step added 160ms at p50');
    expect(report).toContain('over-fetches 20 candidates before reducing to 5');
    expect(report).toContain('Cohere errors fall back to vector order');
    expect(report).toContain('300-word windows with 50-word overlap');
    expect(report).toContain('## Results');
    expect(report).toContain('| # | Question | Rerank | Vector | Sources | Latency | Change |');
    expect(report).toContain('R: rag.md / V: overview.md');
    expect(report).toContain('R 1200ms (120ms) / V 1000ms');
    expect(report).toContain('+200ms total');
    expect(report).not.toContain('### What Changed');
  });
});
