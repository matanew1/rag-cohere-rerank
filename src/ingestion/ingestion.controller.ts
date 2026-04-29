import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { IngestionService } from './ingestion.service';
import { IngestDto } from './dto/ingest.dto';
import { IngestResponseDto } from './dto/ingest-response.dto';

@ApiTags('ingestion')
@Controller('ingest')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ingest documents into the vector store' })
  @ApiBody({ type: IngestDto })
  @ApiOkResponse({ description: 'Ingestion summary', type: IngestResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid ingestion request body' })
  @ApiInternalServerErrorResponse({ description: 'Document loading, embedding, or vector-store failure' })
  ingest(@Body() dto: IngestDto): Promise<IngestResponseDto> {
    return this.ingestionService.ingest(dto.dir);
  }
}
