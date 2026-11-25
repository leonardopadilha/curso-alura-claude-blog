import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { and, asc, eq } from 'drizzle-orm';
import type { Database } from '../db/database.js';
import { comments, users } from '../db/schema.js';
import type { CommentList, CommentResponse, CreateCommentRequest } from './post.schema.js';
import { PostsService } from './posts.service.js';

@Injectable()
export class CommentsService {
  constructor(
    @InjectDrizzle() private readonly db: Database,
    private readonly postsService: PostsService,
  ) {}

  async list(postId: string): Promise<CommentList> {
    await this.postsService.assertExists(postId);
    const rows = await this.select().where(eq(comments.postId, postId)).orderBy(asc(comments.createdAt), asc(comments.id));
    return { items: rows.map(toResponse) };
  }

  async create(
    postId: string,
    authorId: string,
    { content, parentId }: CreateCommentRequest,
  ): Promise<CommentResponse> {
    await this.postsService.assertExists(postId);

    let rootId: string | null = null;
    if (parentId) {
      const [parent] = await this.db
        .select({ id: comments.id, parentId: comments.parentId })
        .from(comments)
        .where(and(eq(comments.id, parentId), eq(comments.postId, postId)));
      if (!parent) {
        throw new UnprocessableEntityException('Parent comment not found in this post');
      }
      // Só há um nível de respostas: responder a uma resposta vale como responder ao comentário raiz.
      rootId = parent.parentId ?? parent.id;
    }

    const [created] = await this.db
      .insert(comments)
      .values({ postId, authorId, content, parentId: rootId })
      .returning({ id: comments.id });
    const [row] = await this.select().where(eq(comments.id, created.id));
    return toResponse(row);
  }

  private select() {
    return this.db
      .select({
        id: comments.id,
        postId: comments.postId,
        parentId: comments.parentId,
        content: comments.content,
        createdAt: comments.createdAt,
        author: { id: users.id, name: users.name },
      })
      .from(comments)
      .innerJoin(users, eq(users.id, comments.authorId));
  }
}

function toResponse(row: {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  createdAt: Date;
  author: { id: string; name: string };
}): CommentResponse {
  return { ...row, createdAt: row.createdAt.toISOString() };
}
