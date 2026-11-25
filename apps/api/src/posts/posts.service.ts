import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { and, desc, eq, sql, type SQL } from 'drizzle-orm';
import type { Database } from '../db/database.js';
import { postLikes, posts, users, comments } from '../db/schema.js';
import type {
  CreatePostRequest,
  LikeResponse,
  ListPostsQuery,
  ListTagsQuery,
  PostDetail,
  PostList,
  PostSummary,
  TagList,
} from './post.schema.js';

/** Normaliza as tags: minúsculas, sem espaços nas pontas e sem repetição. */
export function normalizeTags(tags: readonly string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
}

/**
 * Transforma o texto digitado em uma consulta `tsquery`: cada palavra vira um
 * termo de prefixo (para buscar enquanto se digita) e todas precisam aparecer.
 * Só letras e números passam, então nada do que o usuário digita vira operador.
 */
export function toTsQuery(search: string | undefined): string | undefined {
  const words = search?.match(/[\p{L}\p{N}]+/gu);
  if (!words?.length) return undefined;
  return words.map((word) => `${word}:*`).join(' & ');
}

@Injectable()
export class PostsService {
  constructor(@InjectDrizzle() private readonly db: Database) {}

  async list(query: ListPostsQuery, userId?: string): Promise<PostList> {
    const tags = normalizeTags(query.tags?.split(',') ?? []);
    const tsQuery = toTsQuery(query.search);

    const conditions: SQL[] = [];
    if (tsQuery) {
      conditions.push(sql`${posts.searchVector} @@ to_tsquery('portuguese', ${tsQuery})`);
    }
    if (tags.length) {
      conditions.push(sql`${posts.tags} @> ${tagArray(tags)}`);
    }
    const where = and(...conditions);

    const likesCount = likesCountSql();
    const rows = await this.db
      .select(summaryColumns(userId))
      .from(posts)
      .innerJoin(users, eq(users.id, posts.authorId))
      .where(where)
      .orderBy(
        ...(query.sort === 'popular'
          ? [desc(likesCount), desc(posts.createdAt)]
          : [desc(posts.createdAt)]),
        desc(posts.id),
      )
      .limit(query.limit)
      .offset((query.page - 1) * query.limit);

    const [{ total }] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(posts)
      .where(where);

    return { items: rows.map(toSummary), total, page: query.page, limit: query.limit };
  }

  async findOne(id: string, userId?: string): Promise<PostDetail> {
    const [row] = await this.db
      .select({ ...summaryColumns(userId), code: posts.code })
      .from(posts)
      .innerJoin(users, eq(users.id, posts.authorId))
      .where(eq(posts.id, id))
      .limit(1);
    if (!row) throw new NotFoundException('Post not found');
    return { ...toSummary(row), code: row.code };
  }

  async create(authorId: string, request: CreatePostRequest): Promise<PostDetail> {
    const [created] = await this.db
      .insert(posts)
      .values({
        authorId,
        title: request.title,
        description: request.description,
        code: request.code?.trim() ? request.code : null,
        thumbnailUrl: request.thumbnailUrl ?? null,
        tags: normalizeTags(request.tags),
      })
      .returning({ id: posts.id });
    return this.findOne(created.id, authorId);
  }

  /** Curtir é idempotente: curtir de novo não muda nada. */
  async like(postId: string, userId: string): Promise<LikeResponse> {
    await this.assertExists(postId);
    await this.db.insert(postLikes).values({ postId, userId }).onConflictDoNothing();
    return this.likeState(postId, userId);
  }

  async unlike(postId: string, userId: string): Promise<LikeResponse> {
    await this.assertExists(postId);
    await this.db
      .delete(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
    return this.likeState(postId, userId);
  }

  async popularTags(query: ListTagsQuery): Promise<TagList> {
    const result = await this.db.execute<{ name: string; count: number }>(sql`
      select tag as name, count(*)::int as count
      from ${posts}, unnest(${posts.tags}) as tag
      group by tag
      order by count desc, tag asc
      limit ${query.limit}
    `);
    return { items: result.rows };
  }

  async assertExists(postId: string): Promise<void> {
    const [row] = await this.db.select({ id: posts.id }).from(posts).where(eq(posts.id, postId));
    if (!row) throw new NotFoundException('Post not found');
  }

  private async likeState(postId: string, userId: string): Promise<LikeResponse> {
    const [row] = await this.db
      .select({
        likesCount: sql<number>`count(*)::int`,
        likedByMe: sql<boolean>`coalesce(bool_or(${postLikes.userId} = ${userId}), false)`,
      })
      .from(postLikes)
      .where(eq(postLikes.postId, postId));
    return row;
  }
}

const tagArray = (tags: string[]) =>
  sql`ARRAY[${sql.join(
    tags.map((tag) => sql`${tag}`),
    sql`, `,
  )}]::text[]`;

const likesCountSql = () =>
  sql<number>`(select count(*)::int from ${postLikes} where ${postLikes.postId} = ${posts.id})`;

function summaryColumns(userId?: string) {
  return {
    id: posts.id,
    title: posts.title,
    description: posts.description,
    thumbnailUrl: posts.thumbnailUrl,
    tags: posts.tags,
    createdAt: posts.createdAt,
    author: { id: users.id, name: users.name },
    likesCount: likesCountSql(),
    commentsCount: sql<number>`(select count(*)::int from ${comments} where ${comments.postId} = ${posts.id})`,
    likedByMe: userId
      ? sql<boolean>`exists (select 1 from ${postLikes} where ${postLikes.postId} = ${posts.id} and ${postLikes.userId} = ${userId})`
      : sql<boolean>`false`,
  };
}

function toSummary(row: {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  tags: string[];
  createdAt: Date;
  author: { id: string; name: string };
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
}): PostSummary {
  return { ...row, createdAt: row.createdAt.toISOString() };
}
