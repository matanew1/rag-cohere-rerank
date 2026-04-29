import { CohereRerankService } from '../src/rerank/cohere-rerank.service';
import { Chunk } from '../src/interfaces/chunk.interface';

const makeChunks = (n: number): Chunk[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `${i}`,
    text: `text ${i}`,
    source: 'src.md',
    metadata: {},
  }));

describe('CohereRerankService', () => {
  let mockClient: { rerank: jest.Mock };
  let service: CohereRerankService;

  beforeEach(() => {
    mockClient = { rerank: jest.fn() };
    service = new CohereRerankService(mockClient as any);
  });

  it('returns chunks reordered by Cohere results', async () => {
    const chunks = makeChunks(3);
    mockClient.rerank.mockResolvedValue({ results: [{ index: 2 }, { index: 0 }] });

    const result = await service.rerank('query', chunks, 2);

    expect(result[0].id).toBe('2');
    expect(result[1].id).toBe('0');
  });

  it('falls back to original order when Cohere throws', async () => {
    const chunks = makeChunks(5);
    mockClient.rerank.mockRejectedValue(new Error('API unavailable'));

    const result = await service.rerank('query', chunks, 3);

    expect(result.length).toBe(3);
    expect(result[0].id).toBe('0');
    expect(result[1].id).toBe('1');
  });

  it('passes the correct model to the Cohere client', async () => {
    const chunks = makeChunks(2);
    mockClient.rerank.mockResolvedValue({ results: [{ index: 0 }, { index: 1 }] });

    await service.rerank('question', chunks, 2);

    expect(mockClient.rerank).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'rerank-v3.5' }),
    );
  });
});
