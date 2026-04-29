import { Module } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiService } from './gemini.service';
import { ConfigService } from '../config/config.service';
import { LLM_PROVIDER } from '../interfaces/injection-tokens';

@Module({
  providers: [
    {
      provide: 'GEMINI_MODEL',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const genAI = new GoogleGenerativeAI(config.geminiApiKey);
        return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      },
    },
    GeminiService,
    { provide: LLM_PROVIDER, useExisting: GeminiService },
  ],
  exports: [LLM_PROVIDER],
})
export class LLMModule {}
