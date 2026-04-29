import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VectorStore } from './interfaces/vector-store.interface';
import { VECTOR_STORE } from './interfaces/injection-tokens';
import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('health')
@Controller('health')
export class AppController {
  constructor(@Inject(VECTOR_STORE) private readonly vectorStore: VectorStore) {}

  @Get()
  @ApiOperation({ summary: 'Check API and Chroma connectivity' })
  @ApiOkResponse({ description: 'Service health status', type: HealthResponseDto })
  async health(): Promise<HealthResponseDto> {
    const chromaReady = await this.vectorStore.healthCheck();
    return {
      status: 'ok',
      chroma: chromaReady ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}
