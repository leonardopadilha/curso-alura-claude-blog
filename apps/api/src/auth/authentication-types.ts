import type { User } from '../users/user.js';

// Tipa `@CurrentUser()` e `TokenService.issue()` para este app: o usuário
// carregado pelo `JwtAuth` e tokens de acesso sem refresh token.
declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: User;
    refreshTokens: false;
  }
}
