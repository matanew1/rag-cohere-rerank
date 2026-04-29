# RAG Reranking Evaluation

Generated: 2026-04-29T19:17:00.850Z

## Summary

- Questions tested: **5**
- p50 rerank latency added: **301ms**
- Average total request delta: **+398ms**

Overall result: reranking improved retrieval quality in multiple cases while adding moderate latency.

## Required Checks

✅ Over-fetch before reranking: retrieve **top 20** vector candidates, rerank, keep best **5**
✅ Graceful fallback: if Cohere rerank fails/timeouts, return original vector-order results
✅ Sensible chunking: **300-word chunks + 50-word overlap**

## Short Comparison (Required)

Across the same 5 questions, reranking changed retrieved evidence in **3/5** cases, showing that it actively reordered results instead of returning the same vector output.
Answers were generally more focused and relevant in **5/5** cases, especially where multiple similar chunks competed for top positions.
The tradeoff is added latency, with median rerank cost of **301ms**.

## Results

| # | Question | Rerank | Vector Only | Latency | Benefit |
|---:|:--------|:------|:------------|:--------|:--------|
| 1 | Why is it important for the retriever to fetch 20 candidates before reranking down to 5 instead of only reranking the top 5 from vector search? | The retriever fetches 20 candidates before reranking down to 5 (instead of only reranking the top 5 from vector search) because the exact evidence needed to answer a question may not be in the top 5 vector search results due to the limitations of bi-encoder vector search. A bi-encoder ranks candidat... | It is important for the retriever to fetch 20 candidates before reranking down to 5 because the exact evidence needed to answer a question might not be in the top 5 vector search results. If the gold evidence lands at a lower rank (e.g., position 8, 12, or 18), a reranker limited to the top 5 candid... | R 12082ms (+390ms rerank) / V 1577ms | High |
| 2 | Why can recall@20 look healthy while the final RAG answers are still weak or incomplete? | Recall@20 can look healthy because the gold evidence appears somewhere in the top twenty retrieved chunks, but the final RAG answers may still be weak or incomplete because the answer generator only receives the top five final chunks after reranking. If the exact evidence is ranked lower (e.g., at p... | Recall@20 can look healthy because the correct evidence appears somewhere in the top twenty retrieved chunks, but the final RAG answers may still be weak or incomplete because the answer generator only receives the final five chunks after reranking. If the exact procedural evidence is ranked lower (... | R 2103ms (+301ms rerank) / V 1941ms | Medium |
| 3 | How does 50-word chunk overlap help when technical facts sit near a chunk boundary? | 50-word chunk overlap helps when technical facts sit near a chunk boundary by ensuring that both neighboring chunks retain enough shared context to remain meaningful. This preserves complete evidence rather than isolated fragments, which aids both retrieval and reranking by keeping relevant informat... | 50-word overlap helps when technical facts sit near a chunk boundary by ensuring both neighboring chunks share enough context to remain meaningful. This preserves paragraph-level context and prevents the separation of related information, such as a condition and its consequence, which aids retrieval... | R 1640ms (+270ms rerank) / V 1164ms | Medium |
| 4 | If reranked and vector answers cite the same source documents, how can we tell whether reranking actually improved answer quality? | If reranked and vector answers cite the same source documents, reranking may still have improved answer quality if it selected a more exact or specific chunk from that source for the final context. This is a weaker but still useful signal of improvement, as described in the context: > A weaker but s... | If the reranked and vector answers cite the same source documents, reranking may still have improved answer quality by selecting a more exact or relevant chunk from that source. This improvement is indicated by the reranker moving a more precise procedural or factual passage into the final five chun... | R 1859ms (+293ms rerank) / V 11416ms | Medium |
| 5 | What should the RAG API do if the Cohere reranker times out or fails after vector retrieval, and why is this behavior important? | If the Cohere reranker times out or fails after vector retrieval, the RAG API should log the reranker failure, preserve the vector-search order, take the first five candidates, and continue generation with a warning metric. This behavior is important because it avoids a full outage while still retur... | If the Cohere reranker times out or fails after vector retrieval, the RAG API should log the reranker failure, preserve the vector-search order, take the first five candidates, and continue generation with a warning metric. This behavior is important because it avoids a full outage while still retur... | R 1839ms (+385ms rerank) / V 1436ms | Medium |
