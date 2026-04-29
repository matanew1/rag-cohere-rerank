import { Injectable } from '@nestjs/common';
import { QueryResponseDto } from '../query/dto/query-response.dto';

export interface ComparisonResult {
  question: string;
  withRerank: QueryResponseDto;
  withoutRerank: QueryResponseDto;
}

@Injectable()
export class ReportService {
  generate(results: ComparisonResult[]): string {
    const lines = [
      '# RAG Comparison Report',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      '---',
      '',
    ];

    for (const r of results) {
      lines.push(`## Q: ${r.question}`, '');
      lines.push('### With Reranking');
      lines.push(r.withRerank.answer, '');
      lines.push(`**Citations:** ${r.withRerank.citations.join(', ')}`, '');
      lines.push(`**Latency:** ${r.withRerank.metrics.totalLatencyMs}ms (rerank: ${r.withRerank.metrics.rerankLatencyMs ?? 0}ms)`, '');

      lines.push('### Without Reranking');
      lines.push(r.withoutRerank.answer, '');
      lines.push(`**Citations:** ${r.withoutRerank.citations.join(', ')}`, '');
      lines.push(`**Latency:** ${r.withoutRerank.metrics.totalLatencyMs}ms`, '');
      lines.push('---', '');
    }

    lines.push(...this.buildMetricsSection(results));
    return lines.join('\n');
  }

  private buildMetricsSection(results: ComparisonResult[]): string[] {
    const latencies = results
      .map((r) => r.withRerank.metrics.rerankLatencyMs)
      .filter((l): l is number => l !== undefined)
      .sort((a, b) => a - b);

    const p50 = latencies.length > 0 ? latencies[Math.floor(latencies.length / 2)] : 'N/A';

    return ['## Summary Metrics', '', `- Questions: ${results.length}`, `- p50 rerank latency: ${p50}ms`];
  }
}
