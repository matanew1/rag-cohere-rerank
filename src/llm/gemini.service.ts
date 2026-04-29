import { Injectable, Inject } from '@nestjs/common';
import { Chunk } from '../interfaces/chunk.interface';
import { LLMProvider } from '../interfaces/llm.interface';

export interface GeminiModelLike {
  generateContent(prompt: string): Promise<{ response: { text(): string } }>;
}

@Injectable()
export class GeminiService implements LLMProvider {
  constructor(@Inject('GEMINI_MODEL') private readonly model: GeminiModelLike) {}

  async generate(question: string, chunks: Chunk[]): Promise<string> {
    const context = chunks
      .map((c, i) => `[${i + 1}] (source: ${c.source})\n${c.text}`)
      .join('\n\n');

    const prompt = [
      'You are a helpful assistant. Answer the question using only the provided context.',
      'Cite sources using [1], [2], etc.',
      '',
      `Context:\n${context}`,
      '',
      `Question: ${question}`,
    ].join('\n');

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }
}
