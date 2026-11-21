import { Module } from '@nestjs/common';
import { AuthenticationModule } from '@nestjs/authentication';
import { DrizzleModule } from '@nestjs/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';
import { AuthModule } from './auth/auth.module.js';
import { resolveDatabaseUrl } from './config/database.config.js';
import {
  ACCESS_TOKEN_TTL,
  JWT_AUDIENCE,
  JWT_ISSUER,
  resolveJwtSecret,
} from './config/jwt.config.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    // Postgres via Drizzle ORM. O client é fechado quando a aplicação encerra.
    DrizzleModule.forRootAsync({
      useFactory: () => ({ drizzle, connection: resolveDatabaseUrl() }),
    }),
    // Registra o guard global: toda rota exige JWT, exceto as marcadas `@Public()`.
    AuthenticationModule.forRootAsync({
      useFactory: () => ({
        accessToken: {
          key: resolveJwtSecret(),
          issuer: JWT_ISSUER,
          audience: JWT_AUDIENCE,
          ttl: ACCESS_TOKEN_TTL,
        },
        // Só access token: sem refresh token (e sem store) por enquanto.
        refreshToken: false,
      }),
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
