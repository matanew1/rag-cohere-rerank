import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ChromaRecordDto } from './chroma-record.dto';

export class ChromaPeekQueryDto {
  @ApiProperty({
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
    description: 'Maximum number of records to return',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    required: false,
    default: false,
    description: 'Whether to include full embedding vectors in the response',
  })
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  includeEmbeddings?: boolean = false;
}

export class ChromaPeekResponseDto {
  @ApiProperty({ example: 'rag_documents', description: 'Chroma collection name' })
  collection!: string;

  @ApiProperty({ example: 18, description: 'Total number of records in the collection' })
  count!: number;

  @ApiProperty({ type: [ChromaRecordDto], description: 'Stored records from the collection' })
  records!: ChromaRecordDto[];
}
