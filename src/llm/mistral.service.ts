import { Injectable } from '@nestjs/common';
import { Chunk } from '../interfaces/chunk.interface';
import { LLMProvider } from '../interfaces/llm.interface';
import { ConfigService } from '../config/config.service';

const SYSTEM_PROMPT = [
  'You are a helpful assistant. Answer the question using only the provided context.',
  'Cite sources using [1], [2], etc.',
  'If the context does not contain the answer, say that you do not know from the provided context.',
].join('\n');

type MistralContentChunk = {
  type?: string;
  text?: string;
};

type MistralChatRequest = {
  model: string;
  responseFormat: { type: 'text' };
  messages: Array<{
    role: 'system' | 'user';
    content: string;
  }>;
};

type MistralChatResponse = {
  choices: Array<{
    message?: {
      content?: string | MistralContentChunk[] | null;
    };
  }>;
};

export type MistralClientLike = {
  chat: {
    complete(request: MistralChatRequest): Promise<MistralChatResponse>;
  };
};

type MistralConstructor = new (options: {
  apiKey?: string;
  serverURL?: string;
}) => MistralClientLike;

type MistralModule = {
  Mistral: MistralConstructor;
};

const importMistral = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<MistralModule>;

@Injectable()
export class MistralService implements LLMProvider {
  private clientPromise?: Promise<MistralClientLike>;

  constructor(private readonly config: ConfigService) {}

  async generate(question: string, chunks: Chunk[]): Promise<string> {
    const context = chunks
      .map((c, i) => `[${i + 1}] (source: ${c.source})\n${c.text}`)
      .join('\n\n');

    const client = await this.getClient();
    const response = await client.chat.complete({
      model: this.config.mistralModel,
      responseFormat: { type: 'text' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: [`Context:\n${context}`, '', `Question: ${question}`].join('\n') },
      ],
    });

    const answer = this.extractText(response);
    if (!answer) {
      throw new Error('Mistral API response did not include generated text');
    }

    return answer;
  }

  protected getClient(): Promise<MistralClientLike> {
    this.clientPromise ??= this.createClient();
    return this.clientPromise;
  }

  private async createClient(): Promise<MistralClientLike> {
    const { Mistral } = await importMistral('@mistralai/mistralai');
    return new Mistral({
      apiKey: this.config.mistralApiKey,
      serverURL: this.config.mistralBaseUrl,
    });
  }

  private extractText(response: MistralChatResponse): string | undefined {
    const content = response.choices[0]?.message?.content;

    if (typeof content === 'string') {
      return content.trim();
    }

    if (Array.isArray(content)) {
      return (content as MistralContentChunk[])
        .filter((chunk) => chunk.type === 'text' || chunk.text)
        .map((chunk) => chunk.text ?? '')
        .join('')
        .trim();
    }

    return undefined;
  }
}
