import { Logger } from '@nestjs/common';
import { randomBytes } from 'node:crypto';

const MIN_SECRET_BYTES = 32;

/**
 * Segredo que assina os access tokens (HS256). Em produção `JWT_SECRET` é
 * obrigatório. Fora dela, sem a variável, gera-se um segredo aleatório por
 * processo: como os usuários vivem só em memória, nada se perde a mais.
 */
export function resolveJwtSecret(
  env: Record<string, string | undefined> = process.env,
): string {
  const secret = env.JWT_SECRET;

  if (secret) {
    if (Buffer.byteLength(secret) < MIN_SECRET_BYTES) {
      throw new Error(`JWT_SECRET must be at least ${MIN_SECRET_BYTES} bytes long`);
    }
    return secret;
  }

  if (env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }

  new Logger('JwtConfig').warn(
    'JWT_SECRET is not set: using a random secret for this process only.',
  );
  return randomBytes(MIN_SECRET_BYTES).toString('hex');
}

export const JWT_ISSUER = 'code-connect-api';
export const JWT_AUDIENCE = 'code-connect-web';
export const ACCESS_TOKEN_TTL = '15m';
