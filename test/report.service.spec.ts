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
  it('renders the reranking evaluation report with summary metrics and required checks', () => {
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

    expect(report).toContain('# RAG Reranking Evaluation');
    expect(report).toContain('## Summary');
    expect(report).toContain('- Questions tested: **3**');
    expect(report).toContain('- p50 rerank latency added: **160ms**');
    expect(report).toContain('- Average total request delta: **+217ms**');
    expect(report).toContain('## Required Checks');
    expect(report).toContain('retrieve **top 20** vector candidates, rerank, keep best **5**');
    expect(report).toContain('return original vector-order results');
    expect(report).toContain('**300-word chunks + 50-word overlap**');
    expect(report).toContain('## Short Comparison (Required)');
    expect(report).toContain('Across the same 3 questions');
    expect(report).toContain('## Results');
    expect(report).toContain('| # | Question | Rerank | Vector Only | Latency | Benefit |');
    expect(report).toContain('R 1200ms (+120ms rerank) / V 1000ms');
  });
});
