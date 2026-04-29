import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { QueryOrchestrator } from './query.orchestrator';
import { QueryDto } from './dto/query.dto';
import { QueryResponseDto } from './dto/query-response.dto';

@ApiTags('query')
@Controller('query')
export class QueryController {
  constructor(private readonly orchestrator: QueryOrchestrator) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ask a question against ingested documents' })
  @ApiBody({ type: QueryDto })
  @ApiOkResponse({ description: 'Grounded answer with citations and timing metrics', type: QueryResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid query request body' })
  @ApiInternalServerErrorResponse({ description: 'Embedding, retrieval, reranking, or LLM generation failure' })
  query(@Body() dto: QueryDto): Promise<QueryResponseDto> {
    return this.orchestrator.query(dto.question, dto.useRerank ?? true);
  }
}
