import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email().meta({ description: 'Email cadastrado', example: 'ana@exemplo.com' }),
  password: z
    .string()
    .min(1)
    .max(128)
    .meta({ description: 'Senha do usuário', example: 'segredo123' }),
});
export type LoginRequest = z.infer<typeof loginSchema>;

export const tokenResponseSchema = z.object({
  accessToken: z.string().meta({ description: 'JWT para o header Authorization: Bearer' }),
  tokenType: z.literal('Bearer'),
  expiresIn: z
    .number()
    .int()
    .meta({ description: 'Segundos até o token expirar', example: 900 }),
});
export type TokenResponse = z.infer<typeof tokenResponseSchema>;
