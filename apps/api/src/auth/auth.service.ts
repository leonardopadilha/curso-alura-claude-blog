import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import { UsersService } from '../users/users.service.js';
import type { LoginRequest, TokenResponse } from './auth.schema.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async login({ email, password }: LoginRequest): Promise<TokenResponse> {
    const user = this.usersService.findByEmail(email);

    // Com usuário inexistente o `verify` confere um hash falso: a resposta
    // demora o mesmo e não revela quais emails estão cadastrados.
    const passwordMatches = await this.passwordHasher.verify(
      password,
      user?.passwordHash,
    );

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { accessToken, expiresIn } = await this.tokenService.issue(user.id, {
      method: 'password',
      claims: { amr: ['pwd'] },
    });
    return { accessToken, tokenType: 'Bearer', expiresIn };
  }
}
