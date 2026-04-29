/**
 * Generates substantive PDF reference documents for the sample RAG corpus.
 */
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

interface Section {
  heading: string;
  body: string;
}

interface PdfSource {
  title: string;
  subtitle: string;
  outputPath: string;
  sections: Section[];
}

const TRANSFORMER_SECTIONS: Section[] = [
  {
    heading: 'Introduction to the Transformer Architecture',
    body: `The Transformer is a deep learning architecture introduced in the 2017 paper "Attention Is All You Need" by Vaswani et al. It replaced recurrent networks as the dominant sequence modelling paradigm and became the foundation for every major large language model (LLM) — BERT, GPT, T5, PaLM, LLaMA, and Gemini among them.

Unlike RNNs, which process tokens sequentially and struggle to retain information over long distances, Transformers process all tokens in parallel using a mechanism called self-attention. This makes them highly amenable to modern GPU/TPU hardware and allows them to capture long-range dependencies efficiently.`,
  },
  {
    heading: 'Self-Attention',
    body: `Self-attention (also called scaled dot-product attention) is the core computation in a Transformer. For each token in the input sequence the mechanism computes a weighted sum over all other tokens, where the weights reflect relevance.

Each token embedding is projected into three vectors: Query (Q), Key (K), and Value (V). The attention score between two tokens is computed as the dot product of their Q and K vectors, scaled by the square root of the key dimension to prevent vanishingly small gradients:

    Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) * V

The softmax normalises the scores into a probability distribution, and the output is a weighted combination of the Value vectors. This allows every token to "attend" to every other token in a single parallel operation.`,
  },
  {
    heading: 'Multi-Head Attention',
    body: `Rather than applying a single attention function, Transformers use multi-head attention: the Q, K, and V matrices are projected h times into lower-dimensional subspaces (called heads), attention is computed independently in each head, and the results are concatenated and linearly projected back to the model dimension.

    MultiHead(Q,K,V) = Concat(head_1, ..., head_h) * W_O

Each head learns to attend to different aspects of the input — one head might focus on syntactic relations, another on coreference, and another on semantic similarity. Typical LLMs use 12–96 attention heads depending on model size.`,
  },
  {
    heading: 'Positional Encoding',
    body: `Since self-attention is permutation-invariant (it has no notion of order), Transformers inject positional information via positional encodings added to the input embeddings before the first layer.

The original paper used fixed sinusoidal encodings of different frequencies for each dimension. Modern models use learned positional embeddings or relative positional schemes such as Rotary Position Embedding (RoPE) and ALiBi, which improve generalisation to sequence lengths not seen during training.`,
  },
  {
    heading: 'Feed-Forward Sub-layer',
    body: `After the attention sub-layer, each Transformer block contains a position-wise feed-forward network (FFN) applied identically to each token:

    FFN(x) = max(0, xW_1 + b_1) * W_2 + b_2

The FFN typically expands the hidden dimension by a factor of 4 before projecting back. It is believed to act as a key-value memory that stores factual associations. Modern models replace ReLU with GeLU or SwiGLU activations, which improve training dynamics.`,
  },
  {
    heading: 'Layer Normalisation and Residual Connections',
    body: `Each sub-layer (attention and FFN) is wrapped with a residual connection and layer normalisation:

    output = LayerNorm(x + Sublayer(x))

Residual connections allow gradients to flow directly through the network, mitigating the vanishing gradient problem and enabling very deep stacks (24–96 layers in large models). The original Transformer placed layer norm after the residual; most modern architectures use Pre-LN (before the sub-layer), which stabilises training.`,
  },
  {
    heading: 'Encoder vs Decoder vs Encoder-Decoder',
    body: `Transformer models come in three flavours:

Encoder-only (e.g., BERT): Every token attends to every other token (bidirectional). Ideal for classification, named entity recognition, and producing contextualised embeddings. Used heavily in RAG retrieval pipelines as the embedding backbone.

Decoder-only (e.g., GPT, LLaMA, Gemini): Each token can only attend to past tokens (causal masking). Trained with next-token prediction. The dominant architecture for generative LLMs.

Encoder-decoder (e.g., T5, BART): The encoder processes the input bidirectionally; the decoder attends to the encoder output via cross-attention and generates tokens autoregressively. Well-suited for sequence-to-sequence tasks like translation and summarisation.`,
  },
  {
    heading: 'Scaling Laws',
    body: `Kaplan et al. (2020) established that LLM performance scales predictably with model parameters (N), training tokens (D), and compute (C). The key finding is that each of these factors must be scaled together for optimal efficiency.

Chinchilla (Hoffmann et al., 2022) revised earlier scaling recommendations: for a given compute budget, models are often more efficiently trained by reducing parameters and increasing training data rather than simply using the largest possible model. As a rule of thumb, a model should be trained on roughly 20 tokens per parameter.

These scaling laws guide decisions for both pre-training large foundation models and for choosing the right model size for a given inference budget.`,
  },
  {
    heading: 'Transformers in RAG Pipelines',
    body: `Transformers play two distinct roles in Retrieval-Augmented Generation systems.

As the embedding model: An encoder (e.g., BAAI/bge-small-en, E5, or OpenAI text-embedding-3) converts document chunks and queries into dense vectors. The similarity between these vectors determines which chunks are retrieved during search.

As the reader/generator: A decoder or encoder-decoder LLM (e.g., Gemini, GPT-4, LLaMA) receives the retrieved chunks as context and generates a grounded answer. The quality of the generation depends on the model's instruction-following capability and context window size.

The combination of a lightweight, fast encoder for retrieval and a powerful decoder for generation is the standard RAG setup because it balances latency, cost, and quality.`,
  },
  {
    heading: 'Efficient Transformers and KV Cache',
    body: `The quadratic complexity of self-attention (O(n^2) in sequence length) is a practical bottleneck for long documents. Research has produced many efficient variants: Sparse Attention (Big Bird, Longformer) attends to a subset of tokens; Linear Attention approximates the softmax kernel to achieve O(n) complexity; Flash Attention reorders GPU memory operations to reduce I/O without changing the mathematical result.

During inference, the KV cache stores the key and value tensors for all previously generated tokens so they do not need to be recomputed at each decoding step. This trades memory for compute and is critical for achieving acceptable generation latency in production LLM serving.`,
  },
];

const RAG_RERANK_EVALUATION_SECTIONS: Section[] = [
  {
    heading: 'Purpose of This Playbook',
    body: `This playbook describes how to evaluate reranking in retrieval-augmented generation systems when the corpus contains close semantic distractors. It is intentionally written for cases where vector search already has reasonable recall but the final answer is sensitive to which five chunks are sent to the generator.

The key question is not whether the correct document appears somewhere in the top twenty. The key question is whether the exact evidence appears inside the final context after candidate reduction. A reranker is valuable when it promotes the procedural, factual, or condition-specific passage above generic passages that share the same vocabulary.`,
  },
  {
    heading: 'Expected Candidate Flow',
    body: `A healthy reranking pipeline separates recall and precision. The vector retriever should fetch a broad candidate set such as twenty chunks. Those chunks may include overviews, glossary entries, operational runbooks, evaluation notes, and distractors that mention the same entities. The cross-encoder reranker then reads the user's question together with each candidate and selects the five chunks that answer the question most directly.

This design is different from reranking only the top five vector results. If the gold evidence lands at rank eleven because it uses less common wording, top-five reranking cannot rescue it. Over-fetching creates room for the reranker to recover exact evidence from lower vector ranks.`,
  },
  {
    heading: 'Judging Reranker Benefit',
    body: `Reranker benefit should be judged from final context quality, generated answer specificity, source coverage, and latency. A useful report compares the same question with reranking enabled and disabled. It should show the answer, citations, total latency, rerank latency, and a concise note about what changed.

The strongest positive signal is when vector order misses a specific procedural fact in the final five chunks while reranking includes it, causing the answer to become more complete or less generic. A weaker but still useful signal is when the same source file is cited, but reranking selects a more exact chunk from that file. No visible benefit is expected when the corpus is tiny and every relevant answer is already near the top.`,
  },
  {
    heading: 'Latency Interpretation',
    body: `The p50 rerank latency is the median time spent in the reranker call across the comparison questions. It is not the same as the end-to-end latency delta, because generation latency can vary with answer length, model load, and network conditions. A report should therefore show both the rerank step latency and the full request latency.

If p50 rerank latency is small but end-to-end latency is much larger, the bottleneck is probably generation variance or external API behavior rather than Cohere itself. If both rerank latency and end-to-end latency are high, teams may reduce the over-fetch size, cache rerank results, or reserve reranking for ambiguous queries.`,
  },
  {
    heading: 'Failure Handling',
    body: `The reranker should fail open. If Cohere returns an error, times out, or is rate limited, the service should return the top five vector-order chunks and continue generation. The application should log the event and expose metrics so operators know quality may have degraded.

Failing closed is worse for most knowledge-assistant workflows because it turns a quality enhancement into an availability dependency. Returning vector-order context is an acceptable fallback because it still uses retrieved evidence and preserves citations.`,
  },
  {
    heading: 'Difficult Evaluation Questions',
    body: `Good evaluation questions are deliberately specific. They ask about conditions, tradeoffs, or operational behavior that appears in one passage and is only loosely related to many others. Examples include: what should happen if Cohere times out after retrieval, why recall at twenty can still produce weak final answers, and why overlap protects facts near chunk boundaries.

These questions are more diagnostic than generic prompts such as "What is RAG?" because generic prompts can be answered from many chunks. Reranking is most visible when the correct answer depends on distinguishing an exact procedural passage from plausible but incomplete neighbors.`,
  },
];

const AMBIGUOUS_EVIDENCE_AUDIT_SECTIONS: Section[] = [
  {
    heading: 'Ambiguous Evidence Audit',
    body: `This audit contains intentionally overlapping terminology. It uses words such as fallback, vector order, reranking, latency, recall, chunking, and generation in multiple contexts. The purpose is to make vector retrieval work harder and to reward systems that can identify the passage that answers the exact user question.

In a clean corpus, semantic search may return the right source every time. In a realistic corpus, many teams have duplicated runbooks, support notes, release plans, incident reviews, and architecture docs that repeat similar phrasing. The reranker is useful because it scores relevance at query-document level rather than relying only on independently produced embeddings.`,
  },
  {
    heading: 'Exact Evidence: Fallback After Reranker Failure',
    body: `If a reranker fails after the vector store has already produced candidates, the answer path should continue with vector-order results. The service should take the first five retrieved chunks, generate a grounded response, and record that reranking was unavailable. This behavior is specifically about candidate ordering after retrieval, not about switching to a different language model.

The exact evidence contains three required details: the pipeline already has retrieved candidates, the fallback preserves vector order, and the response remains grounded in citations. A candidate that only discusses generic fallback or retry logic is a distractor.`,
  },
  {
    heading: 'Distractor: Fallback As Model Routing',
    body: `A separate platform document describes fallback from a large model to a smaller model during traffic spikes. It mentions latency, rate limits, quality degradation, and user experience. Although the language overlaps with RAG fallback incidents, it does not answer what to do when a Cohere reranker fails after retrieval.

This passage is deliberately plausible for vector search because it shares terms such as fallback, latency, rate limit, model, quality, and degraded response. A reranker should score it below the exact evidence when the question asks about vector-order results.`,
  },
  {
    heading: 'Exact Evidence: Recall At Twenty Versus Final Five',
    body: `A retrieval run can have high recall at twenty while still producing weak answers. This happens when the needed evidence appears somewhere in the broad candidate set but is not included in the final five chunks sent to the generator. The problem is final-context precision, not initial recall.

Reranking helps by moving exact evidence above broad overviews and near-topic distractors. The correct diagnosis is to inspect the final context used by the language model, not only the top twenty candidates returned by vector search.`,
  },
  {
    heading: 'Distractor: Recall In Human Support',
    body: `Support managers sometimes discuss recall as an agent's ability to remember a prior customer interaction. They may also describe final resolution, escalation rate, and time to answer. This use of recall is operationally important but unrelated to recall at k in information retrieval.

The passage shares terms such as support, recall, final, answer, and escalation. It should not outrank the evidence about recall at twenty and final five chunks for RAG generation.`,
  },
  {
    heading: 'Exact Evidence: Chunk Overlap',
    body: `A 50-word overlap protects facts that sit near a chunk boundary. If the first chunk ends with a condition and the next chunk begins with the consequence, overlap gives both neighboring chunks enough shared context to remain meaningful. This helps retrieval and reranking because candidates contain complete evidence rather than isolated fragments.

The chunk size should be tuned intentionally. A 300-word window with 50-word overlap is a simple baseline for technical prose because it preserves paragraph-level context while limiting noise inside each embedding.`,
  },
  {
    heading: 'Distractor: Chunking In Media Delivery',
    body: `Streaming video systems split media into chunks so players can adapt bitrate and buffer ahead. The relevant settings include segment duration, CDN behavior, and playback stalls. This passage mentions chunks, latency, buffers, and overlap in a networking sense, but it does not explain textual overlap for RAG documents.

An embedding retriever may surface this passage for a vague chunking question. A reranker should demote it when the question asks about technical facts near a document boundary.`,
  },
];

const PDF_SOURCES: PdfSource[] = [
  {
    title: 'Transformer Architecture',
    subtitle: 'A Reference for RAG Pipeline Practitioners',
    outputPath: path.resolve('documents/sample/transformer-architecture.pdf'),
    sections: TRANSFORMER_SECTIONS,
  },
  {
    title: 'RAG Rerank Evaluation Playbook',
    subtitle: 'Operational Criteria for Measuring Reranker Value',
    outputPath: path.resolve('documents/sample/rag-rerank-evaluation-playbook.pdf'),
    sections: RAG_RERANK_EVALUATION_SECTIONS,
  },
  {
    title: 'Ambiguous Evidence Audit',
    subtitle: 'Near-Miss Passages for Testing RAG Reranking',
    outputPath: path.resolve('documents/sample/ambiguous-evidence-audit.pdf'),
    sections: AMBIGUOUS_EVIDENCE_AUDIT_SECTIONS,
  },
];

function buildPdf(source: PdfSource): void {
  const doc = new PDFDocument({ margin: 60, size: 'A4' });
  const stream = fs.createWriteStream(source.outputPath);
  doc.pipe(stream);

  // Title page
  doc
    .fontSize(26)
    .font('Helvetica-Bold')
    .text(source.title, { align: 'center' })
    .moveDown(0.4)
    .fontSize(13)
    .font('Helvetica')
    .text(source.subtitle, { align: 'center' })
    .moveDown(0.3)
    .fontSize(10)
    .fillColor('#555555')
    .text(`Generated: ${new Date().toISOString().slice(0, 10)}`, { align: 'center' })
    .fillColor('#000000')
    .moveDown(2);

  doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke().moveDown(1.5);

  for (const section of source.sections) {
    // Avoid orphaned headings at the bottom of a page
    if (doc.y > 680) doc.addPage();

    doc.fontSize(14).font('Helvetica-Bold').text(section.heading).moveDown(0.4);
    doc.fontSize(11).font('Helvetica').text(section.body, { align: 'justify', lineGap: 3 }).moveDown(1.2);
  }

  doc.end();
  stream.on('finish', () => console.log(`PDF written to ${source.outputPath}`));
}

for (const source of PDF_SOURCES) {
  buildPdf(source);
}
