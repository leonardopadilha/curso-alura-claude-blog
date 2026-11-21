import { ConflictException, type INestApplication } from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import { eq } from 'drizzle-orm';
import type { Database } from '../src/db/database.js';
import { users } from '../src/db/schema.js';
import { UsersService } from '../src/users/users.service.js';
import { createTestApp, resetDatabase } from './create-test-app.js';

const ana = { name: 'Ana Souza', email: 'ana@exemplo.com', password: 'segredo123' };

// Integração do serviço com o Postgres real (banco de testes).
describe('UsersService (Postgres)', () => {
  let app: INestApplication;
  let service: UsersService;

  beforeEach(async () => {
    app = await createTestApp();
    await resetDatabase(app);
    service = app.get(UsersService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('persists the user in the database with a hash instead of the password', async () => {
    const user = await service.create(ana);

    const [row] = await app
      .get<Database>(getDrizzleToken())
      .select()
      .from(users)
      .where(eq(users.id, user.id));
    expect(row).toMatchObject({ name: 'Ana Souza', email: 'ana@exemplo.com' });
    expect(row.passwordHash).toMatch(/^\$scrypt\$/);
    expect(row.passwordHash).not.toContain(ana.password);
    expect(row.createdAt).toBeInstanceOf(Date);
  });

  it('normalizes the email to lowercase', async () => {
    const user = await service.create({ ...ana, email: '  Ana@Exemplo.COM ' });
    expect(user.email).toBe('ana@exemplo.com');
  });

  it('rejects a duplicated email regardless of case', async () => {
    await service.create(ana);
    await expect(service.create({ ...ana, email: 'ANA@exemplo.com' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('lets only one of two simultaneous registrations with the same email through', async () => {
    const results = await Promise.allSettled([service.create(ana), service.create(ana)]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    const [rejected] = results.filter((result) => result.status === 'rejected');
    expect(rejected.reason).toBeInstanceOf(ConflictException);
  });

  it('finds users by id and by email', async () => {
    const user = await service.create(ana);

    expect(await service.findById(user.id)).toEqual(user);
    expect(await service.findByEmail('ANA@exemplo.com')).toEqual(user);
    expect(await service.findById('00000000-0000-4000-8000-000000000000')).toBeUndefined();
    expect(await service.findByEmail('outra@exemplo.com')).toBeUndefined();
  });
});
