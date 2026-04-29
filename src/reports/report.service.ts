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
      '# RAG Comparison',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      ...this.buildMetricsSection(results),
      ...this.buildTakeaways(results),
      ...this.buildResultsTable(results),
    ];

    return lines.join('\n');
  }

  private buildMetricsSection(results: ComparisonResult[]): string[] {
    const p50 = this.p50RerankLatency(results);
    const avgTotalDelta = this.averageTotalDelta(results);

    return [
      '## Summary',
      '',
      '| Questions | p50 rerank | Avg total delta | Retrieved -> used |',
      '|---:|---:|---:|---:|',
      `| ${results.length} | ${p50}ms | ${this.formatMsDelta(avgTotalDelta)} | 20 -> 5 |`,
      '',
    ];
  }

  private buildTakeaways(results: ComparisonResult[]): string[] {
    const sameSources = results.filter((r) => this.sameStringSet(r.withRerank.citations, r.withoutRerank.citations)).length;
    const avgOverlap =
      results.length > 0
        ? Math.round(
            results.reduce((sum, r) => sum + this.termOverlap(r.withRerank.answer, r.withoutRerank.answer), 0) /
              results.length *
              100,
          )
        : 0;
    const p50 = this.p50RerankLatency(results);
    const avgTotalDelta = this.averageTotalDelta(results);

    return [
      '## Takeaways',
      '',
      `Reranking changed wording and answer length more than sources: ${sameSources}/${results.length} questions cited the same source set, with ${avgOverlap}% average key-term overlap.`,
      `The rerank step added ${p50}ms at p50; average end-to-end latency changed by ${this.formatMsDelta(avgTotalDelta)}.`,
      'The retrieval path over-fetches 20 candidates before reducing to 5, Cohere errors fall back to vector order, and chunking uses 300-word windows with 50-word overlap.',
      '',
    ];
  }

  private buildResultsTable(results: ComparisonResult[]): string[] {
    return [
      '## Results',
      '',
      '| # | Question | Rerank | Vector | Sources | Latency | Change |',
      '|---:|---|---|---|---|---:|---|',
      ...results.map((result, index) => this.buildResultRow(result, index + 1)),
      '',
    ];
  }

  private buildResultRow(result: ComparisonResult, index: number): string {
    const totalDelta = result.withRerank.metrics.totalLatencyMs - result.withoutRerank.metrics.totalLatencyMs;
    const rerankLatency = result.withRerank.metrics.rerankLatencyMs ?? 0;
    const wordDelta = this.countWords(result.withRerank.answer) - this.countWords(result.withoutRerank.answer);
    const overlapPercent = Math.round(this.termOverlap(result.withRerank.answer, result.withoutRerank.answer) * 100);

    const values = [
      index,
      this.cell(result.question),
      this.cell(this.snippet(result.withRerank.answer)),
      this.cell(this.snippet(result.withoutRerank.answer)),
      this.cell(this.sourceSummary(result)),
      this.cell(`R ${result.withRerank.metrics.totalLatencyMs}ms (${rerankLatency}ms) / V ${result.withoutRerank.metrics.totalLatencyMs}ms`),
      this.cell(`${this.formatMsDelta(totalDelta)} total; ${this.formatNumberDelta(wordDelta)} words; ${overlapPercent}% terms`),
    ];

    return `| ${values.join(' | ')} |`;
  }

  private p50RerankLatency(results: ComparisonResult[]): number | 'N/A' {
    const latencies = results
      .map((r) => r.withRerank.metrics.rerankLatencyMs)
      .filter((l): l is number => l !== undefined)
      .sort((a, b) => a - b);

    return latencies.length > 0 ? latencies[Math.floor(latencies.length / 2)] : 'N/A';
  }

  private averageTotalDelta(results: ComparisonResult[]): number {
    return results.length > 0
      ? Math.round(
          results.reduce(
            (sum, r) => sum + r.withRerank.metrics.totalLatencyMs - r.withoutRerank.metrics.totalLatencyMs,
            0,
          ) / results.length,
        )
      : 0;
  }

  private sourceSummary(result: ComparisonResult): string {
    const withCitations = result.withRerank.citations;
    const withoutCitations = result.withoutRerank.citations;

    if (this.sameStringSet(withCitations, withoutCitations)) {
      return `same: ${this.formatList(withCitations)}`;
    }

    return `R: ${this.formatList(withCitations)} / V: ${this.formatList(withoutCitations)}`;
  }

  private sameStringSet(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((value) => b.includes(value));
  }

  private formatList(values: string[]): string {
    return values.length > 0 ? values.join(', ') : 'none';
  }

  private countWords(text: string): number {
    return this.terms(text).length;
  }

  private snippet(text: string): string {
    const normalized = text.replace(/\s+/g, ' ').trim();
    return normalized.length <= 140 ? normalized : `${normalized.slice(0, 137)}...`;
  }

  private cell(value: string): string {
    return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  }

  private termOverlap(a: string, b: string): number {
    const aTerms = new Set(this.terms(a));
    const bTerms = new Set(this.terms(b));
    const union = new Set([...aTerms, ...bTerms]);

    if (union.size === 0) {
      return 1;
    }

    const intersectionSize = [...aTerms].filter((term) => bTerms.has(term)).length;
    return intersectionSize / union.size;
  }

  private terms(text: string): string[] {
    return text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  }

  private formatMsDelta(delta: number): string {
    if (delta === 0) {
      return 'unchanged';
    }

    return `${delta > 0 ? '+' : ''}${delta}ms`;
  }

  private formatNumberDelta(delta: number): string {
    if (delta === 0) {
      return 'unchanged';
    }

    return `${delta > 0 ? '+' : ''}${delta}`;
  }
}
