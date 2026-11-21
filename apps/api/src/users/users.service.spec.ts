import { ConflictException } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { vi } from 'vitest';
import type { Database } from '../db/database.js';
import { UsersService } from './users.service.js';

/** Mínimo do query builder usado por `create`: insert().values().returning(). */
function createDbMock(returning: () => Promise<unknown[]>) {
  const values = vi.fn(() => ({ returning }));
  const db = { insert: vi.fn(() => ({ values })) };
  return { db: db as unknown as Database, values };
}

const ana = { name: 'Ana Souza', email: '  Ana@Exemplo.COM ', password: 'segredo123' };

describe('UsersService.create', () => {
  // Hasher barato: o padrão (scrypt N=2^17) deixaria a suíte lenta.
  const hasher = new PasswordHasher({ logN: 10 });

  it('stores the normalized email and a password hash, never the password', async () => {
    const row = { id: 'id-1' };
    const { db, values } = createDbMock(async () => [row]);

    const user = await new UsersService(db, hasher).create(ana);

    expect(user).toBe(row);
    expect(values).toHaveBeenCalledWith({
      name: 'Ana Souza',
      email: 'ana@exemplo.com',
      passwordHash: expect.stringMatching(/^\$scrypt\$/),
    });
    expect(JSON.stringify(values.mock.calls)).not.toContain('segredo123');
  });

  it.each([
    ['the driver error itself', { code: '23505' }],
    ['the driver error wrapped by Drizzle (error.cause)', { cause: { code: '23505' } }],
  ])('turns a unique violation into 409 (%s)', async (_label, error) => {
    const { db } = createDbMock(() => Promise.reject(error));

    await expect(new UsersService(db, hasher).create(ana)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('does not swallow other database errors', async () => {
    const failure = { code: '08006', message: 'connection failure' };
    const { db } = createDbMock(() => Promise.reject(failure));

    await expect(new UsersService(db, hasher).create(ana)).rejects.toBe(failure);
  });
});
