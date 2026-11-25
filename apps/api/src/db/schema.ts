import { sql } from 'drizzle-orm';
import {
  customType,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';

/** Tipo `tsvector` do Postgres (busca full text). */
const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  // Guardado em minúsculas; o índice único garante um cadastro por email,
  // inclusive com requisições simultâneas.
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const posts = pgTable(
  'posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    /** Trecho de código mostrado na página de detalhes. */
    code: text('code'),
    /** Sem thumbnail (null), o front mostra um placeholder. */
    thumbnailUrl: text('thumbnail_url'),
    /** Sempre em minúsculas e sem repetição (garantido pelo serviço). */
    tags: text('tags')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Coluna gerada pelo próprio banco: nunca é escrita pela aplicação. Título
    // pesa mais que a descrição. A busca full text usa o dicionário português.
    searchVector: tsvector('search_vector').generatedAlwaysAs(
      sql`setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') || setweight(to_tsvector('portuguese', coalesce(description, '')), 'B')`,
    ),
  },
  (table) => [
    index('posts_search_idx').using('gin', table.searchVector),
    index('posts_tags_idx').using('gin', table.tags),
    index('posts_created_at_idx').on(table.createdAt),
  ],
);

export const postLikes = pgTable(
  'post_likes',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  // Um usuário curte um post uma única vez.
  (table) => [primaryKey({ columns: [table.postId, table.userId] })],
);

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** Preenchido nas respostas. Só há um nível: a resposta de uma resposta aponta para o comentário raiz. */
    parentId: uuid('parent_id').references((): AnyPgColumn => comments.id, {
      onDelete: 'cascade',
    }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('comments_post_id_idx').on(table.postId, table.createdAt)],
);
