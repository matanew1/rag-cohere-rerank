# Production RAG Case Studies

## Case 1: Reranker Timeout During Retrieval

A production RAG service should treat the reranker as a quality improvement, not as a hard dependency for answering. In the incident review, the retriever successfully returned twenty candidate chunks from the vector store, but the Cohere reranker timed out before returning the final five. The correct behavior was to log the reranker failure, preserve the vector-search order, take the first five candidates, and continue generation with a warning metric. This avoided a full outage while still returning grounded answers from the available candidate set.

The team explicitly rejected a design where the API returned a 500 whenever reranking failed. Users preferred a slightly less precise answer over no answer, and the fallback made latency more predictable during vendor incidents. The fallback also made it possible to compare answer quality later, because the response still included citations, chunks retrieved, chunks used, and rerank latency when available.

## Case 2: Why Over-Fetch Before Reranking

The retrieval stage intentionally over-fetches: it asks vector search for twenty semantically plausible chunks even though the language model only receives five chunks. This gives the reranker a broader candidate set to inspect. A bi-encoder vector search is fast, but it can rank a generic passage above a more exact one because the query and document embeddings are produced independently. A cross-encoder reranker jointly reads the query with each candidate document, so it can promote the passage that directly answers the question.

Reranking only the top five vector candidates is usually too late. If the exact answer lands at position eight, twelve, or eighteen in vector order, a top-five-only reranker never sees it. The production policy therefore uses recall-oriented vector retrieval first, then precision-oriented reranking second.

## Case 3: Recall@20 Is Not Enough

In one offline evaluation, recall@20 looked healthy because the gold evidence appeared somewhere in the twenty retrieved chunks for most questions. However, answer quality was still uneven because the generator only received five final chunks. Without reranking, several final contexts contained broad overview passages, glossary definitions, and near-topic distractors while the best operational evidence stayed lower in the list.

The reranker improved the final context by moving exact procedural passages above generic semantic matches. The main quality gain was not that the source document changed; it was that the most relevant chunk from the same source moved into the final five. This is why comparison reports should show both latency and answer/source changes.

## Case 4: Chunk Boundaries

Chunking should preserve enough local context for retrieval and citation. The sample pipeline uses fixed 300-word chunks with 50 words of overlap because many technical explanations span multiple paragraphs. The overlap protects facts that appear near the end of one chunk and are explained at the beginning of the next chunk.

Blind defaults are risky because a chunk can become too small to contain the answer, too large to fit the embedding model's useful context, or split in a way that separates a condition from its consequence. Word-boundary metadata helps inspect which part of a source produced a chunk and makes debugging easier.

## Case 5: Near-Miss Semantic Matches

Vector embeddings are excellent at finding text that is broadly about the same topic, but they are less reliable when several passages share vocabulary and differ in intent. For example, a question about reranker fallback may retrieve chunks about retry policies, latency budgets, cross-validation, or model fallback because all of them mention failures and evaluation. A reranker can compare the exact question against each candidate and prefer the passage that names the requested behavior.

This is the best setting for reranking: a corpus with many plausible candidates, high lexical overlap, and details where wording matters. In a tiny clean corpus, vector search may already return the same sources in a good order, so reranking adds latency without visible benefit.
