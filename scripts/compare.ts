import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import { AppModule } from '../src/app.module';
import { QueryOrchestrator } from '../src/query/query.orchestrator';
import { ReportService, ComparisonResult } from '../src/reports/report.service';

const QUESTIONS = [
  'Why is it important for the retriever to fetch 20 candidates before reranking down to 5 instead of only reranking the top 5 from vector search?',
  'Why can recall@20 look healthy while the final RAG answers are still weak or incomplete?',
  'How does 50-word chunk overlap help when technical facts sit near a chunk boundary?',
  'If reranked and vector answers cite the same source documents, how can we tell whether reranking actually improved answer quality?',
  'What should the RAG API do if the Cohere reranker times out or fails after vector retrieval, and why is this behavior important?',
];

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { 
    logger: ['error', 'warn'] 
  });

  const orchestrator = app.get(QueryOrchestrator);
  const reporter = new ReportService();
  const results: ComparisonResult[] = [];

  console.log(`Running ${QUESTIONS.length} questions × 2 modes (with vs without rerank)…\n`);

  for (const question of QUESTIONS) {
    console.log(`Q: ${question}`);

    const withRerank = await orchestrator.query(question, true);
    console.log(`  rerank=ON   ${withRerank.metrics.totalLatencyMs}ms`);

    const withoutRerank = await orchestrator.query(question, false);
    console.log(`  rerank=OFF  ${withoutRerank.metrics.totalLatencyMs}ms`);

    results.push({ question, withRerank, withoutRerank });
  }

  const report = reporter.generate(results);
  fs.mkdirSync('reports', { recursive: true });
  fs.writeFileSync('reports/comparison.md', report, 'utf-8');

  console.log('\nReport successfully written to reports/comparison.md');
  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});