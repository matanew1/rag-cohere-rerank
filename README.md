# rag-cohere-rerank

NestJS RAG pipeline with Chroma vector search, Cohere reranking, Mistral generation, Swagger docs, and a mixed sample corpus of PDF, Markdown, and text files.

## What It Does

The service ingests local documents, chunks them, embeds each chunk with `@xenova/transformers`, stores vectors in Chroma, retrieves candidate chunks for a question, optionally reranks them with Cohere, and sends the final context to Mistral.

```text
POST /api/ingest -> DocumentLoader -> ChunkService -> EmbeddingService -> ChromaService
POST /api/query  -> EmbeddingService -> ChromaService -> CohereRerank -> MistralService
GET  /api/health -> ChromaService.healthCheck()
```

Every provider sits behind a typed interface (`Embedder`, `VectorStore`, `Reranker`, `LLMProvider`) and is wired through NestJS dependency injection, so services can be mocked or swapped without changing orchestration code.

## Quick Start

```bash
npm install
cp .env.example .env
```

Fill in `COHERE_API_KEY` and `MISTRAL_API_KEY` in `.env`, then start Chroma:

```bash
docker compose up -d chroma
```

Start the NestJS API locally:

```bash
npm run start:dev
```

The API runs at `http://localhost:3000/api`.

Swagger UI is available at:

```text
http://localhost:3000/api/docs
```

## Sample Flow

Ingest the sample documents:

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H 'Content-Type: application/json' \
  -d '{"dir": "documents/sample"}'
```

Ask a question:

```bash
curl -X POST http://localhost:3000/api/query \
  -H 'Content-Type: application/json' \
  -d '{"question": "How does reranking improve RAG?", "useRerank": true}'
```

Check service health:

```bash
curl http://localhost:3000/api/health
```

## API

### `GET /api/health`

Returns API status, Chroma connectivity, and a timestamp.

```json
{
  "status": "ok",
  "chroma": "connected",
  "timestamp": "2026-04-29T16:00:00.000Z"
}
```

### `POST /api/ingest`

Loads `.md`, `.txt`, and `.pdf` files from a directory, chunks them, embeds them, and upserts them into Chroma.

Request body:

```json
{
  "dir": "documents/sample"
}
```

Response:

```json
{
  "documentsProcessed": 10,
  "chunksIngested": 28
}
```

### `POST /api/query`

Runs retrieval, optional reranking, and answer generation.

Request body:

```json
{
  "question": "What is retrieval-augmented generation?",
  "useRerank": true
}
```

Response:

```json
{
  "answer": "...",
  "citations": ["rag-overview.md"],
  "metrics": {
    "totalLatencyMs": 1234,
    "rerankLatencyMs": 210,
    "chunksRetrieved": 20,
    "chunksUsed": 5
  }
}
```

## Docker Helpers

The compose file starts Chroma by default. Docker helper scripts are included for local reset workflows:

```bash
npm run docker:down     # docker compose down --remove-orphans
npm run docker:clean    # also removes compose volumes, including Chroma data
npm run docker:rebuild  # docker compose build --no-cache
npm run docker:reset    # clean, rebuild, then docker compose up
```

The app Dockerfile uses `node:20-bookworm-slim` because `@xenova/transformers` depends on `onnxruntime-node`, which needs glibc-based Linux runtime libraries.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `COHERE_API_KEY` | required | Cohere API key for reranking |
| `MISTRAL_API_KEY` | required | Mistral AI API key |
| `MISTRAL_MODEL` | `mistral-small-latest` | Mistral model used for answer generation |
| `MISTRAL_BASE_URL` | `https://api.mistral.ai` | Mistral API server URL passed to the SDK |
| `CHROMA_URL` | `http://localhost:8000` | Chroma server URL |
| `CHROMA_COLLECTION` | `rag_documents` | Chroma collection name |
| `PORT` | `3000` | HTTP port |

## Sample Documents

`documents/sample/` contains a mixed corpus with exact-answer passages and near-miss distractors so reranking has a meaningful precision task:

```text
PDF: transformer-architecture.pdf, llm-serving-latency.pdf, rag-rerank-evaluation-playbook.pdf, ambiguous-evidence-audit.pdf
MD:  rag-overview.md, machine-learning.md, rag-production-cases.md, support-runbook.md
TXT: neural-networks.txt, retrieval-distractors.txt
```

## Tests

```bash
npm test
npm run test:cov
```

Tests cover chunking, Cohere rerank ordering and fallback behavior, and query orchestration.

In restricted environments where Watchman cannot write local state, run:

```bash
npm test -- --watchman=false
```

## Comparison Script

After the service is running and documents are ingested, run:

```bash
npm run compare
```

The script asks ten fixed diagnostic questions with reranking on and off, then writes `reports/comparison.md` with a compact results table, 2-3 sentence takeaways, source differences, and p50 rerank latency.

Implementation notes for review:

- Retrieval over-fetches 20 candidates before Cohere reranks down to the final 5 chunks.
- Cohere failures degrade gracefully by returning the vector-order top chunks.
- Chunking is explicit: 300-word chunks with 50-word overlap, plus source and word-boundary metadata.

## Project Structure

```text
src/
  config/           ConfigService
  dto/              Shared response DTOs
  interfaces/       Chunk, Embedder, VectorStore, Reranker, LLMProvider
  chunking/         ChunkService
  embedding/        EmbeddingService
  vector-store/     ChromaService
  rerank/           CohereRerankService
  llm/              MistralService
  ingestion/        Document loading and ingestion API
  query/            Query orchestration and query API
  reports/          ReportService
documents/sample/   Sample PDF, Markdown, and text corpus
scripts/            PDF generation and comparison scripts
test/               Jest unit tests
```
