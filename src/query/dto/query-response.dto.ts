import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QueryMetricsDto {
  @ApiProperty({ example: 1240, description: 'End-to-end query latency in milliseconds' })
  totalLatencyMs: number;

  @ApiPropertyOptional({ example: 180, description: 'Reranking latency in milliseconds when reranking is enabled' })
  rerankLatencyMs?: number;

  @ApiProperty({ example: 20, description: 'Number of candidate chunks retrieved from vector search' })
  chunksRetrieved: number;

  @ApiProperty({ example: 5, description: 'Number of chunks used as final context for answer generation' })
  chunksUsed: number;
}

export class QueryResponseDto {
  @ApiProperty({
    example: 'Reranking improves precision by scoring retrieved chunks against the query more deeply before generation.',
    description: 'Generated answer grounded in the retrieved context',
  })
  answer!: string;

  @ApiProperty({
    type: [String],
    example: ['rag-overview.md', 'transformer-architecture.pdf'],
    description: 'Unique source documents cited by the chunks used for generation',
  })
  citations!: string[];

  @ApiProperty({ type: () => QueryMetricsDto, description: 'Retrieval and generation timing metrics' })
  metrics!: QueryMetricsDto;
}
