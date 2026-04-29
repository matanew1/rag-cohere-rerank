import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QueryDto {
  @ApiProperty({
    example: 'How does reranking improve retrieval-augmented generation?',
    description: 'Natural-language question to answer using the ingested document corpus',
  })
  @IsString()
  @IsNotEmpty()
  question!: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Whether to rerank vector-search candidates before generation',
  })
  @IsBoolean()
  @IsOptional()
  useRerank?: boolean = true;
}
