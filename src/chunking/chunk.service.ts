import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Chunk } from '../interfaces/chunk.interface';

@Injectable()
export class ChunkService {
  private readonly wordsPerChunk = 300;
  private readonly overlapWords = 50;

  chunk(text: string, source: string): Chunk[] {
    const words = text.split(/\s+/).filter(Boolean);
    const chunks: Chunk[] = [];
    let start = 0;

    while (start < words.length) {
      const end = Math.min(start + this.wordsPerChunk, words.length);
      const chunkText = words.slice(start, end).join(' ');

      chunks.push({
        id: uuidv4(),
        text: chunkText,
        source,
        metadata: { wordStart: start, wordEnd: end },
      });

      if (end >= words.length) break;
      start += this.wordsPerChunk - this.overlapWords;
    }

    return chunks;
  }
}
