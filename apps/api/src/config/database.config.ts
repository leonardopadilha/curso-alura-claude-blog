/** Conexão do Postgres do `docker-compose.yml` (só para desenvolvimento local). */
export const DEFAULT_DEV_DATABASE_URL =
  'postgres://code_connect:code_connect@localhost:5432/code_connect';

/**
 * URL de conexão do Postgres. Em produção `DATABASE_URL` é obrigatória; fora
 * dela, sem a variável, usa-se o banco do docker compose.
 */
export function resolveDatabaseUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }

  if (env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL is required in production');
  }

  return DEFAULT_DEV_DATABASE_URL;
}
