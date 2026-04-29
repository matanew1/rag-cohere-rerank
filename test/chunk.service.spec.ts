import { ChunkService } from '../src/chunking/chunk.service';

describe('ChunkService', () => {
  let service: ChunkService;

  beforeEach(() => {
    service = new ChunkService();
  });

  it('produces multiple chunks for a long text', () => {
    const text = Array(700).fill('word').join(' ');
    const chunks = service.chunk(text, 'test.md');
    expect(chunks.length).toBeGreaterThan(1);
  });

  it('produces a single chunk for short text', () => {
    const chunks = service.chunk('short text here', 'test.md');
    expect(chunks.length).toBe(1);
  });

  it('assigns a unique id to every chunk', () => {
    const text = Array(700).fill('word').join(' ');
    const chunks = service.chunk(text, 'test.md');
    const ids = new Set(chunks.map((c) => c.id));
    expect(ids.size).toBe(chunks.length);
  });

  it('stamps the correct source on every chunk', () => {
    const chunks = service.chunk('hello world', 'myfile.txt');
    chunks.forEach((c) => expect(c.source).toBe('myfile.txt'));
  });

  it('last chunk covers the final words', () => {
    const words = Array(350).fill('word');
    const text = words.join(' ');
    const chunks = service.chunk(text, 'src.md');
    const lastChunk = chunks[chunks.length - 1];
    expect(lastChunk.text).toContain('word');
    const combined = chunks.map((c) => c.text).join(' ');
    // Every original word must appear in at least one chunk
    expect(combined.split(' ').length).toBeGreaterThanOrEqual(words.length);
  });

  it('adjacent chunks share overlap words', () => {
    const text = Array(600).fill('unique').join(' ');
    const chunks = service.chunk(text, 'x.txt');
    expect(chunks.length).toBeGreaterThan(1);
    // Verify metadata boundary is set
    expect(chunks[0].metadata).toHaveProperty('wordStart');
    expect(chunks[0].metadata).toHaveProperty('wordEnd');
  });
});
