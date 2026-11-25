import { resolve } from 'node:path';

/** Caminho público (fora do prefixo `/v1`) em que os arquivos enviados são servidos. */
export const UPLOADS_PREFIX = '/uploads';

/** Tamanho máximo de uma imagem enviada. */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

/**
 * Pasta dos arquivos enviados. `UPLOADS_DIR` sobrescreve; o padrão é
 * `apps/api/uploads` (a partir de `src/config` ou `dist/config`), ignorada pelo git.
 */
export function resolveUploadsDir(
  env: Record<string, string | undefined> = process.env,
): string {
  return env.UPLOADS_DIR ? resolve(env.UPLOADS_DIR) : resolve(import.meta.dirname, '../../uploads');
}
