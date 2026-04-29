import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import { AppModule } from '../src/app.module';
import { QueryOrchestrator } from '../src/query/query.orchestrator';
import { ReportService, ComparisonResult } from '../src/reports/report.service';

const QUESTIONS = [
  'If Cohere reranking times out after vector retrieval, what should the RAG API do and why?',
  'Why should the retriever fetch 20 candidates before reranking down to 5 instead of reranking only the vector top 5?',
  'Why can recall@20 look healthy while final RAG answers are still weak?',
  'What problem does 50-word chunk overlap solve when technical facts sit near a chunk boundary?',
  'When several passages share words like fallback, vector order, and latency, how does a cross-encoder reranker choose the best evidence?',
  'How should we tell whether reranking helped if the reranked and vector answers cite the same source file?',
  'What is the difference between fallback to vector-order chunks and fallback to a smaller language model?',
  'Why are generic questions like "What is RAG?" less useful for evaluating a reranker than operational questions about failures or boundaries?',
  'What should operators inspect when the correct evidence appears in the top 20 retrieved chunks but the generated answer is still generic?',
  'How do near-miss passages about video chunking, UI vector order, or model routing test whether reranking is working?',
];

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });

  const orchestrator = app.get(QueryOrchestrator);
  const reporter = new ReportService();
  const results: ComparisonResult[] = [];

  console.log(`Running ${QUESTIONS.length} questions × 2 modes…\n`);

  for (const question of QUESTIONS) {
    console.log(`Q: ${question}`);

    const withRerank = await orchestrator.query(question, true);
    console.log(`  rerank=ON  ${withRerank.metrics.totalLatencyMs}ms`);

    const withoutRerank = await orchestrator.query(question, false);
    console.log(`  rerank=OFF ${withoutRerank.metrics.totalLatencyMs}ms`);

    results.push({ question, withRerank, withoutRerank });
  }

  const report = reporter.generate(results);
  fs.mkdirSync('reports', { recursive: true });
  fs.writeFileSync('reports/comparison.md', report, 'utf-8');

  console.log('\nReport written to reports/comparison.md');
  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
