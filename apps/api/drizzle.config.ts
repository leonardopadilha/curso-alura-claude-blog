import { defineConfig } from 'drizzle-kit';

// `drizzle-kit` roda fora do Nest: sem DI, e sem `.js` nos imports relativos.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    // Mesmo padrão de `src/config/database.config.ts` (banco do docker compose).
    url:
      process.env.DATABASE_URL ??
      'postgres://code_connect:code_connect@localhost:5432/code_connect',
  },
});
