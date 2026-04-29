# Support Runbook for RAG Quality Incidents

## Symptom: Correct Source Retrieved But Weak Answer

When the correct source appears in the retrieved candidate set but the generated answer is still weak, inspect the final context rather than only the top twenty retrieval results. The answer generator only sees the final five chunks. If the exact evidence was retrieved at rank nine or fifteen, it counts as retrieval recall but it does not help generation unless reranking promotes it.

The runbook action is to compare vector order against reranked order for the same query. If reranking moves the procedural chunk into the final five and the answer becomes more specific, the retriever has enough recall and the reranker is improving precision. If both modes use the same chunks, the issue is probably prompt quality, source quality, or insufficient document coverage.

## Symptom: Reranker Vendor Error

If the reranker API returns an error, times out, or hits quota, the query endpoint should continue with vector-order results. Operators should alert on the error rate and latency, but the user response should still be generated from retrieved chunks. The response metrics should make the degradation visible by omitting rerank latency or recording the fallback path.

This fallback is acceptable because vector retrieval is already a reasonable baseline. It is not acceptable to silently invent an answer without retrieved context, because that defeats the purpose of RAG grounding.

## Symptom: Chunk Boundary Miss

If a question requires a condition and consequence that are split across adjacent chunks, increase overlap or adjust chunking. The current sample pipeline uses 300-word windows and 50-word overlap to keep nearby context together. For legal contracts, API docs, or troubleshooting guides, teams may tune these values after inspecting missed answers.

Chunking quality should be tested with long documents, not only short examples. A short document can make almost any splitter look good because the whole document fits into one chunk.
