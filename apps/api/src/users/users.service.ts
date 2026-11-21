import { ConflictException, Injectable } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { InjectDrizzle } from '@nestjs/drizzle';
import { eq } from 'drizzle-orm';
import type { Database } from '../db/database.js';
import { users } from '../db/schema.js';
import type { User } from './user.js';
import type { CreateUserRequest } from './user.schema.js';

/** Código do Postgres para violação de índice único. */
const UNIQUE_VIOLATION = '23505';

@Injectable()
export class UsersService {
  constructor(
    @InjectDrizzle() private readonly db: Database,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async create({ name, email, password }: CreateUserRequest): Promise<User> {
    const passwordHash = await this.passwordHasher.hash(password);

    try {
      const [user] = await this.db
        .insert(users)
        .values({ name, email: normalizeEmail(email), passwordHash })
        .returning();
      return user;
    } catch (error) {
      // A unicidade é garantida pelo índice do banco: vale também para
      // cadastros simultâneos, que uma checagem antes do insert não pegaria.
      if (isUniqueViolation(error)) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async findById(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, normalizeEmail(email)))
      .limit(1);
    return user;
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** O Drizzle embrulha o erro do driver em `error.cause`; cobre os dois formatos. */
function isUniqueViolation(error: unknown): boolean {
  const { code, cause } = error as { code?: unknown; cause?: { code?: unknown } };
  return code === UNIQUE_VIOLATION || cause?.code === UNIQUE_VIOLATION;
}
