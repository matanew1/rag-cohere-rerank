/**
 * Generates documents/sample/transformer-architecture.pdf — a substantive
 * reference document that the RAG pipeline can ingest alongside the existing
 * markdown and txt samples.
 */
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

const OUT_PATH = path.resolve('documents/sample/transformer-architecture.pdf');

interface Section {
  heading: string;
  body: string;
}

const SECTIONS: Section[] = [
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

function buildPdf(outputPath: string): void {
  const doc = new PDFDocument({ margin: 60, size: 'A4' });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Title page
  doc
    .fontSize(26)
    .font('Helvetica-Bold')
    .text('Transformer Architecture', { align: 'center' })
    .moveDown(0.4)
    .fontSize(13)
    .font('Helvetica')
    .text('A Reference for RAG Pipeline Practitioners', { align: 'center' })
    .moveDown(0.3)
    .fontSize(10)
    .fillColor('#555555')
    .text(`Generated: ${new Date().toISOString().slice(0, 10)}`, { align: 'center' })
    .fillColor('#000000')
    .moveDown(2);

  doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke().moveDown(1.5);

  for (const section of SECTIONS) {
    // Avoid orphaned headings at the bottom of a page
    if (doc.y > 680) doc.addPage();

    doc.fontSize(14).font('Helvetica-Bold').text(section.heading).moveDown(0.4);
    doc.fontSize(11).font('Helvetica').text(section.body, { align: 'justify', lineGap: 3 }).moveDown(1.2);
  }

  doc.end();
  stream.on('finish', () => console.log(`PDF written to ${outputPath}`));
}

buildPdf(OUT_PATH);
