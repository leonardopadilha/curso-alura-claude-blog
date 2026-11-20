import { ConflictException, Injectable } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { randomUUID } from 'node:crypto';
import type { User } from './user.js';
import type { CreateUserRequest } from './user.schema.js';

/** Persistência provisória: um array em memória, perdido a cada reinício. */
@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  constructor(private readonly passwordHasher: PasswordHasher) {}

  async create({ name, email, password }: CreateUserRequest): Promise<User> {
    const normalizedEmail = normalizeEmail(email);
    // O hash é assíncrono: calculá-lo antes de checar e inserir mantém a
    // checagem de duplicidade e o `push` na mesma etapa síncrona (sem corrida).
    const passwordHash = await this.passwordHasher.hash(password);

    if (this.findByEmail(normalizedEmail)) {
      throw new ConflictException('Email already registered');
    }

    const user: User = {
      id: randomUUID(),
      name,
      email: normalizedEmail,
      passwordHash,
    };
    this.users.push(user);
    return user;
  }

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  findByEmail(email: string): User | undefined {
    const normalizedEmail = normalizeEmail(email);
    return this.users.find((user) => user.email === normalizedEmail);
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
