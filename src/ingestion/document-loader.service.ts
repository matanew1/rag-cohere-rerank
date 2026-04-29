import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import pdfParse = require('pdf-parse');

export interface RawDocument {
  text: string;
  source: string;
}

@Injectable()
export class DocumentLoaderService {
  private readonly logger = new Logger(DocumentLoaderService.name);
  private readonly supportedExtensions = new Set(['.md', '.txt', '.pdf']);

  async load(dir: string): Promise<RawDocument[]> {
    const absDir = path.resolve(dir);
    if (!fs.existsSync(absDir)) {
      throw new NotFoundException(`Directory not found: ${absDir}`);
    }
    if (!fs.statSync(absDir).isDirectory()) {
      throw new NotFoundException(`Not a directory: ${absDir}`);
    }
    const files = fs.readdirSync(absDir).filter((f) =>
      this.supportedExtensions.has(path.extname(f).toLowerCase()),
    );
    if (files.length === 0) {
      throw new NotFoundException(`No files found in directory: ${absDir}`);
    }

    const docs: RawDocument[] = [];
    for (const file of files) {
      const text = await this.readFile(path.join(absDir, file));
      if (text) {
        docs.push({ text, source: file });
        this.logger.log(`Loaded: ${file}`);
      }
    }
    return docs;
  }

  private async readFile(filePath: string): Promise<string | null> {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.md' || ext === '.txt') {
      return fs.readFileSync(filePath, 'utf-8');
    }
    if (ext === '.pdf') {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text;
    }
    return null;
  }
}
