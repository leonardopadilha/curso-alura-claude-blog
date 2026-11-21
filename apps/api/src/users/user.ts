import type { users } from '../db/schema.js';

/** Linha da tabela `users`. Nunca é serializada direto: veja `toUserResponse`. */
export type User = typeof users.$inferSelect;
