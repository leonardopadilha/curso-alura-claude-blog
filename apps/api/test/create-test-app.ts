import { PasswordHasher } from '@nestjs/authentication';
import type { INestApplication } from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import { Test } from '@nestjs/testing';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import type { Database } from '../src/db/database.js';
import { users } from '../src/db/schema.js';

/** Esvazia as tabelas para que cada teste comece do zero. */
export async function resetDatabase(app: INestApplication) {
  await app.get<Database>(getDrizzleToken()).delete(users);
}

/** Aplicação completa (como em produção) ligada ao banco de testes. */
export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    // Hasher barato nos testes (o padrão usa scrypt com N=2^17).
    .overrideProvider(PasswordHasher)
    .useValue(new PasswordHasher({ logN: 10 }))
    .compile();

  const app = moduleRef.createNestApplication<INestApplication<App>>();
  setupApp(app);
  await app.init();
  return app;
}
