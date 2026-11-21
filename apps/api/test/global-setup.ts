import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';

/**
 * Prepara o banco de testes antes da suíte e2e: cria `<banco>_test` se não
 * existir (no mesmo Postgres do docker compose) e aplica as migrations.
 */
export default async function setup() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set by vitest.config.e2e.ts');
  }

  const url = new URL(databaseUrl);
  const databaseName = decodeURIComponent(url.pathname.slice(1));
  // Os testes apagam dados: nunca rodar contra um banco que não seja de teste.
  if (!databaseName.endsWith('_test')) {
    throw new Error(`Refusing to run e2e tests on "${databaseName}": the name must end with "_test"`);
  }

  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = '/postgres';
  const admin = new Client({ connectionString: adminUrl.toString() });
  try {
    await admin.connect();
  } catch (error) {
    throw new Error(
      `Cannot reach Postgres at ${url.host}. Start it with "pnpm db:up" and retry.`,
      { cause: error },
    );
  }

  try {
    const { rowCount } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      databaseName,
    ]);
    if (!rowCount) {
      await admin.query(`CREATE DATABASE "${databaseName.replaceAll('"', '""')}"`);
    }
  } finally {
    await admin.end();
  }

  const db = drizzle(databaseUrl);
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
  } finally {
    await db.$client.end();
  }
}
