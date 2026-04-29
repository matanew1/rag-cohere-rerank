# Retrieval-Augmented Generation (RAG)

## What is RAG?

Retrieval-Augmented Generation (RAG) is an AI architecture that combines information retrieval with large language model generation. Instead of relying solely on the knowledge encoded in a model's weights during pre-training, RAG retrieves relevant documents from an external knowledge base at query time and provides them as context to the language model.

This approach addresses two key limitations of standard LLMs: knowledge cutoffs and hallucination. Because the retrieved documents are grounded in real data, the model can produce factually accurate answers even about events after its training cutoff.

## Core Components

A RAG pipeline has three main stages:

**Indexing:** Documents are chunked into smaller passages, converted into dense vector embeddings using an encoder model, and stored in a vector database. Common vector stores include Chroma, Pinecone, Weaviate, and FAISS.

**Retrieval:** At query time, the user's question is embedded using the same encoder model. The resulting query vector is used to perform approximate nearest-neighbor (ANN) search against the indexed document embeddings. The top-k most similar chunks are returned as candidates.

**Generation:** The retrieved chunks are concatenated with the query and fed as context to a large language model. The model generates a grounded answer using the provided context.

## Vector Embeddings in RAG

Vector embeddings are dense numerical representations of text that capture semantic meaning. Two semantically similar sentences will have embeddings that are close together in high-dimensional space (measured by cosine similarity or dot product).

Popular embedding models include `BAAI/bge-small-en`, `text-embedding-ada-002`, and `sentence-transformers/all-MiniLM-L6-v2`. Smaller models are faster and cheaper; larger models provide higher quality representations.

## Reranking for Precision

A common enhancement to RAG pipelines is to add a reranking step between retrieval and generation. The retriever returns a large candidate set (e.g., top 20 chunks) using approximate vector search. A cross-encoder reranker then scores each candidate against the query more precisely and reorders them. Only the top-N reranked results (e.g., top 5) are passed to the LLM.

Reranking improves precision because cross-encoders jointly encode the query and document together, capturing nuanced relevance signals that bi-encoders miss. Cohere's `rerank-v3.5` model is a popular choice because it requires no fine-tuning and works well out of the box.

### Rerank Fallback

In production systems, the reranker should never be a single point of failure. If the reranking API call fails (network error, quota exceeded, etc.), the pipeline should gracefully fall back to the vector similarity ordering of the original candidate set and proceed without interruption.

## Citations and Transparency

RAG systems naturally support source attribution. Each retrieved chunk tracks its source document, so the generated answer can include inline citations like [1], [2] pointing back to specific passages. This transparency is valuable in enterprise and research settings where verifiability matters.

## Chunking Strategy

Chunking splits long documents into passages that fit within the embedding model's context window. Common strategies include fixed-size chunking with overlap (e.g., 300 words per chunk, 50-word overlap), sentence-boundary chunking, and recursive character text splitting.

Overlap between adjacent chunks ensures that information near chunk boundaries is not lost. The optimal chunk size depends on the embedding model and the nature of the documents.

## Evaluation

RAG pipelines are typically evaluated on retrieval recall (did the answer appear in the retrieved chunks?), answer faithfulness (does the answer contradict the context?), and answer relevance (does the answer address the question?). Tools such as RAGAS and TruEra provide automated evaluation frameworks.
