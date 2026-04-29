import { ApiProperty } from '@nestjs/swagger';

export class Chunk {
  @ApiProperty({ example: '6b0a6f8b-4420-42ad-a90e-54f746f1a9d3', description: 'Stable chunk identifier' })
  id!: string;

  @ApiProperty({
    example: 'Reranking improves precision because cross-encoders jointly encode the query and document.',
    description: 'Chunk text stored in the vector database',
  })
  text!: string;

  @ApiProperty({ example: 'rag-overview.md', description: 'Source document filename' })
  source!: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: { wordStart: 0, wordEnd: 300 },
    description: 'Additional source and chunk metadata',
  })
  metadata!: Record<string, unknown>;
}
