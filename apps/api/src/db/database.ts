import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

/** Tipo do banco injetado com `@InjectDrizzle()`. */
export type Database = NodePgDatabase;
