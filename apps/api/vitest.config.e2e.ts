import { defineConfig } from 'vitest/config';

// Os testes e2e usam um banco próprio (`*_test`) no Postgres do docker compose,
// para nunca tocar nos dados de desenvolvimento. `TEST_DATABASE_URL` sobrescreve.
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgres://code_connect:code_connect@localhost:5432/code_connect_test';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    globalSetup: ['./test/global-setup.ts'],
    // Os arquivos dividem o mesmo banco: rodam um de cada vez.
    fileParallelism: false,
  },
});
