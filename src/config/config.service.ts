import 'dotenv/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  readonly cohereApiKey: string = process.env.COHERE_API_KEY ?? '';
  readonly mistralApiKey: string = process.env.MISTRAL_API_KEY ?? '';
  readonly mistralModel: string = process.env.MISTRAL_MODEL ?? 'mistral-small-latest';
  readonly mistralBaseUrl: string = process.env.MISTRAL_BASE_URL ?? 'https://api.mistral.ai';
  readonly chromaUrl: string = process.env.CHROMA_URL ?? 'http://localhost:8000';
  readonly collectionName: string = process.env.CHROMA_COLLECTION ?? 'rag_documents';
  readonly port: number = parseInt(process.env.PORT ?? '3000', 10);
}
