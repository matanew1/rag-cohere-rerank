import 'dotenv/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  readonly cohereApiKey: string = process.env.COHERE_API_KEY ?? '';
  readonly geminiApiKey: string = process.env.GEMINI_API_KEY ?? '';
  readonly chromaUrl: string = process.env.CHROMA_URL ?? 'http://localhost:8000';
  readonly collectionName: string = process.env.CHROMA_COLLECTION ?? 'rag_documents';
  readonly port: number = parseInt(process.env.PORT ?? '3000', 10);
}
