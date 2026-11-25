import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import { UPLOADS_PREFIX, resolveUploadsDir } from '../config/uploads.config.js';

/** Extensão pelo conteúdo do arquivo (o `Content-Type` enviado pelo cliente não é confiável). */
export function detectImageExtension(buffer: Buffer): 'png' | 'jpg' | 'webp' | undefined {
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'png';
  }
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'jpg';
  if (buffer.subarray(0, 4).toString('latin1') === 'RIFF' && buffer.subarray(8, 12).toString('latin1') === 'WEBP') {
    return 'webp';
  }
  return undefined;
}

@Injectable()
export class UploadsService {
  /** Salva a imagem com nome aleatório e devolve o caminho público. */
  async saveImage(buffer: Buffer): Promise<string> {
    const extension = detectImageExtension(buffer);
    if (!extension) {
      throw new UnsupportedMediaTypeException('Only PNG, JPEG and WebP images are accepted');
    }

    const directory = resolveUploadsDir();
    await mkdir(directory, { recursive: true });
    const fileName = `${randomUUID()}.${extension}`;
    await writeFile(join(directory, fileName), buffer);
    return `${UPLOADS_PREFIX}/${fileName}`;
  }
}
