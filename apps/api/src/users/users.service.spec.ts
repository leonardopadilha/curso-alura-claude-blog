import { ConflictException } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    // Hasher barato: o padrão (scrypt N=2^17) deixaria a suíte lenta.
    service = new UsersService(new PasswordHasher({ logN: 10 }));
  });

  const ana = { name: 'Ana Souza', email: 'ana@exemplo.com', password: 'segredo123' };

  it('creates a user with an id and stores a hash instead of the password', async () => {
    const user = await service.create(ana);

    expect(user.id).toEqual(expect.any(String));
    expect(user).toMatchObject({ name: 'Ana Souza', email: 'ana@exemplo.com' });
    expect(user.passwordHash).not.toContain(ana.password);
    expect(user.passwordHash).toMatch(/^\$scrypt\$/);
  });

  it('normalizes the email to lowercase', async () => {
    const user = await service.create({ ...ana, email: '  Ana@Exemplo.COM ' });
    expect(user.email).toBe('ana@exemplo.com');
  });

  it('rejects a duplicated email regardless of case', async () => {
    await service.create(ana);
    await expect(
      service.create({ ...ana, email: 'ANA@exemplo.com' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('allows only one of two concurrent registrations with the same email', async () => {
    const results = await Promise.allSettled([service.create(ana), service.create(ana)]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
  });

  it('finds users by id and by email', async () => {
    const user = await service.create(ana);
    expect(service.findById(user.id)).toBe(user);
    expect(service.findByEmail('ANA@exemplo.com')).toBe(user);
    expect(service.findById('inexistente')).toBeUndefined();
    expect(service.findByEmail('outra@exemplo.com')).toBeUndefined();
  });
});
