import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChromaService } from './chroma.service';
import { ChromaPeekQueryDto, ChromaPeekResponseDto } from './dto/chroma-peek.dto';

@ApiTags('chroma')
@Controller('chroma')
export class ChromaController {
  constructor(private readonly chromaService: ChromaService) {}

  @Get()
  @ApiOperation({ summary: 'Peek at records stored in Chroma' })
  @ApiOkResponse({ description: 'Chroma collection count and stored records', type: ChromaPeekResponseDto })
  peek(@Query() query: ChromaPeekQueryDto): Promise<ChromaPeekResponseDto> {
    return this.chromaService.peek(query.limit ?? 10, query.includeEmbeddings ?? false);
  }
}
