import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class IngestDto {
  @ApiPropertyOptional({
    example: 'documents/sample',
    description: 'Directory containing .md, .txt, and .pdf documents to ingest',
    default: 'documents/sample',
  })
  @IsOptional()
  @IsString()
  dir?: string;
}
