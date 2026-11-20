import { Injectable } from '@nestjs/common';
import {
  AuthenticationRegistry,
  JwtBearerProvider,
  type JwtClaims,
} from '@nestjs/authentication';
import type { User } from '../users/user.js';
import { UsersService } from '../users/users.service.js';

/**
 * Autentica `Authorization: Bearer <jwt>`. O token é verificado com as mesmas
 * opções de `accessToken` do módulo; aqui só se carrega o usuário dono dele.
 * Devolver `null` (usuário inexistente) rejeita o token com 401.
 */
@Injectable()
export class JwtAuth extends JwtBearerProvider<User> {
  constructor(
    private readonly usersService: UsersService,
    registry: AuthenticationRegistry,
  ) {
    super({ realm: 'code-connect' });
    registry.registerProvider(this, { order: 1 });
  }

  protected validate({ sub }: JwtClaims): User | null {
    return (sub && this.usersService.findById(sub)) || null;
  }
}
