import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import { AppModule } from '../src/app.module';
import { QueryOrchestrator } from '../src/query/query.orchestrator';
import { ReportService, ComparisonResult } from '../src/reports/report.service';

const QUESTIONS = [
  'What is retrieval-augmented generation and how does it work?',
  'How does backpropagation train a neural network?',
  'What are the advantages of reranking in RAG pipelines?',
  'Explain the difference between supervised and unsupervised learning.',
  'What role do vector embeddings play in semantic search?',
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
