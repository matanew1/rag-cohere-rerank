import { ApiProperty } from '@nestjs/swagger';

export class IngestResponseDto {
  @ApiProperty({ example: 6, description: 'Number of documents loaded from the source directory' })
  documentsProcessed!: number;

  @ApiProperty({ example: 18, description: 'Number of chunks embedded and stored in Chroma' })
  chunksIngested!: number;
}
