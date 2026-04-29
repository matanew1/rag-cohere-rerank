import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok', description: 'Overall API status' })
  status!: string;

  @ApiProperty({
    enum: ['connected', 'disconnected'],
    example: 'connected',
    description: 'Chroma vector store connectivity status',
  })
  chroma!: 'connected' | 'disconnected';

  @ApiProperty({
    example: '2026-04-29T16:00:00.000Z',
    description: 'ISO timestamp for the health check response',
  })
  timestamp!: string;
}
