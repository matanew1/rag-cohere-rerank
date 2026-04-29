import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChromaRecordDto {
  @ApiProperty({ example: '6b0a6f8b-4420-42ad-a90e-54f746f1a9d3', description: 'Chroma record ID' })
  id!: string;

  @ApiProperty({ example: 'rag-overview.md', description: 'Source document filename' })
  source!: string;

  @ApiProperty({
    example: 'Reranking improves precision because cross-encoders jointly encode the query and document.',
    description: 'Stored chunk text',
  })
  text!: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: { wordStart: 0, wordEnd: 300, source: 'rag-overview.md' },
    description: 'Stored Chroma metadata',
  })
  metadata!: Record<string, unknown>;

  @ApiPropertyOptional({
    type: [Number],
    example: [0.021, -0.104, 0.333],
    description: 'Embedding vector preview. Only returned when includeEmbeddings=true.',
  })
  embedding?: number[];
}
