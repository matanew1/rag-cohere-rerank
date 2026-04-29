import { ConfigService } from '../src/config/config.service';
import { Chunk } from '../src/interfaces/chunk.interface';
import { MistralClientLike, MistralService } from '../src/llm/mistral.service';

class TestMistralService extends MistralService {
  constructor(
    config: ConfigService,
    private readonly client: MistralClientLike,
  ) {
    super(config);
  }

  protected override async getClient(): Promise<MistralClientLike> {
    return this.client;
  }
}

describe('MistralService', () => {
  const chunks: Chunk[] = [
    {
      id: '1',
      text: 'Reranking moves the most relevant retrieved chunks to the top.',
      source: 'rag.md',
      metadata: {},
    },
  ];

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses the Mistral SDK chat completion and returns the assistant text', async () => {
    const complete = jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'Reranking improves answer grounding [1].' } }],
    });
    const client = { chat: { complete } } as unknown as MistralClientLike;

    const config = {
      mistralApiKey: 'test-key',
      mistralModel: 'mistral-small-latest',
      mistralBaseUrl: 'https://api.mistral.ai',
    } as ConfigService;
    const service = new TestMistralService(config, client);

    await expect(service.generate('How does reranking help?', chunks)).resolves.toBe(
      'Reranking improves answer grounding [1].',
    );

    expect(complete).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'mistral-small-latest',
        responseFormat: { type: 'text' },
      }),
    );

    const request = complete.mock.calls[0][0];
    expect(request.messages[1].content).toContain('source: rag.md');
    expect(request.messages[1].content).toContain('How does reranking help?');
  });

  it('supports text chunks returned by the SDK', async () => {
    const client = {
      chat: {
        complete: jest.fn().mockResolvedValue({
          choices: [{ message: { content: [{ type: 'text', text: 'Chunked answer [1].' }] } }],
        }),
      },
    } as unknown as MistralClientLike;

    const config = {
      mistralApiKey: 'test-key',
      mistralModel: 'mistral-small-latest',
      mistralBaseUrl: 'https://api.mistral.ai',
    } as ConfigService;
    const service = new TestMistralService(config, client);

    await expect(service.generate('Question?', chunks)).resolves.toBe('Chunked answer [1].');
  });
});
