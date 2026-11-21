import { UnauthorizedException } from '@nestjs/common';
import type { PasswordHasher, TokenService } from '@nestjs/authentication';
import { vi } from 'vitest';
import type { User } from '../users/user.js';
import type { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

const user: User = {
  id: 'user-1',
  name: 'Ana Souza',
  email: 'ana@exemplo.com',
  passwordHash: 'hash',
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

function setup({ found = true, passwordMatches = true } = {}) {
  const usersService = { findByEmail: vi.fn(async () => (found ? user : undefined)) };
  const passwordHasher = { verify: vi.fn(async () => passwordMatches) };
  const tokenService = {
    issue: vi.fn(async () => ({ accessToken: 'jwt', expiresIn: 900 })),
  };
  const service = new AuthService(
    usersService as unknown as UsersService,
    passwordHasher as unknown as PasswordHasher,
    tokenService as unknown as TokenService,
  );
  return { service, usersService, passwordHasher, tokenService };
}

describe('AuthService', () => {
  const credentials = { email: 'ana@exemplo.com', password: 'segredo123' };

  it('issues an access token for valid credentials', async () => {
    const { service, passwordHasher, tokenService } = setup();

    await expect(service.login(credentials)).resolves.toEqual({
      accessToken: 'jwt',
      tokenType: 'Bearer',
      expiresIn: 900,
    });
    expect(passwordHasher.verify).toHaveBeenCalledWith('segredo123', 'hash');
    expect(tokenService.issue).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ method: 'password' }),
    );
  });

  it('rejects a wrong password with 401 and issues no token', async () => {
    const { service, tokenService } = setup({ passwordMatches: false });

    await expect(service.login(credentials)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(tokenService.issue).not.toHaveBeenCalled();
  });

  it('rejects an unknown email with 401, still running the password check', async () => {
    const { service, passwordHasher, tokenService } = setup({ found: false });

    await expect(service.login(credentials)).rejects.toBeInstanceOf(UnauthorizedException);
    // `undefined` faz o hasher conferir um hash falso (tempo de resposta igual).
    expect(passwordHasher.verify).toHaveBeenCalledWith('segredo123', undefined);
    expect(tokenService.issue).not.toHaveBeenCalled();
  });
});
