import { z } from 'zod';
import type { User } from './user.js';

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .meta({ description: 'Nome completo', example: 'Ana Souza' }),
  email: z.email().meta({
    description: 'Email do usuário (único, sem diferenciar maiúsculas)',
    example: 'ana@exemplo.com',
  }),
  password: z
    .string()
    .min(8)
    .max(128)
    .meta({ description: 'Senha (mínimo de 8 caracteres)', example: 'segredo123' }),
});
export type CreateUserRequest = z.infer<typeof createUserSchema>;

export const userResponseSchema = z.object({
  id: z.uuid().meta({ description: 'Identificador do usuário' }),
  name: z.string().meta({ example: 'Ana Souza' }),
  email: z.email().meta({ example: 'ana@exemplo.com' }),
});
export type UserResponse = z.infer<typeof userResponseSchema>;

/** Converte o usuário para a resposta pública. O `parse` descarta `passwordHash`. */
export function toUserResponse(user: User): UserResponse {
  return userResponseSchema.parse(user);
}
