import { z } from 'zod';
import { requiredError } from '../common/zod.js';
import { UPLOADS_PREFIX } from '../config/uploads.config.js';

export const idParamSchema = z.object({
  id: z.uuid({ error: 'Invalid id' }).meta({ description: 'Identificador do post' }),
});
export type IdParam = z.infer<typeof idParamSchema>;

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export const POST_SORTS = ['recent', 'popular'] as const;

export const listPostsQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(100)
    .optional()
    .meta({
      description:
        'Busca full text no título e na descrição (feita pelo banco, em português). Cada palavra vale como prefixo ("reac" encontra "React") e todas precisam aparecer.',
      example: 'acessibilidade react',
    }),
  tags: z
    .string()
    .max(300)
    .optional()
    .meta({
      description: 'Tags separadas por vírgula. O post precisa ter todas elas.',
      example: 'react,front-end',
    }),
  sort: z
    .enum(POST_SORTS)
    .default('recent')
    .meta({ description: '`recent`: mais novos primeiro. `popular`: mais curtidos primeiro.' }),
  page: z.coerce.number().int().min(1).default(1).meta({ description: 'Página (começa em 1)' }),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .default(12)
    .meta({ description: 'Itens por página (máximo de 50)' }),
});
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;

const thumbnailUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => value.startsWith(`${UPLOADS_PREFIX}/`) || /^https?:\/\/\S+$/.test(value),
    { error: `Must be an http(s) URL or an uploaded file (${UPLOADS_PREFIX}/...)` },
  );

export const createPostSchema = z.object({
  title: z
    .string({ error: requiredError })
    .trim()
    .min(1)
    .max(120)
    .meta({ description: 'Título do post', example: 'React zero to hero' }),
  description: z
    .string({ error: requiredError })
    .trim()
    .min(1)
    .max(2000)
    .meta({ description: 'Descrição do projeto' }),
  code: z
    .string()
    .max(10000)
    .optional()
    .meta({ description: 'Trecho de código exibido na página de detalhes' }),
  thumbnailUrl: thumbnailUrlSchema.optional().meta({
    description: `Imagem de capa: URL de um arquivo enviado em \`POST /uploads\` ou uma URL http(s). Sem ela, o front mostra um placeholder.`,
    example: `${UPLOADS_PREFIX}/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed.png`,
  }),
  tags: z
    .array(z.string().trim().min(1).max(30))
    .max(10)
    .default([])
    .meta({ description: 'Até 10 tags (guardadas em minúsculas, sem repetição)', example: ['react'] }),
});
export type CreatePostRequest = z.infer<typeof createPostSchema>;

const authorSchema = z.object({
  id: z.uuid(),
  name: z.string().meta({ example: 'Júlio Andrade' }),
});

export const postSummarySchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string(),
  thumbnailUrl: z.string().nullable().meta({ description: 'Null quando o post não tem imagem' }),
  tags: z.array(z.string()),
  author: authorSchema,
  likesCount: z.number().int(),
  commentsCount: z.number().int(),
  likedByMe: z
    .boolean()
    .meta({ description: 'Se o usuário logado curtiu o post (sempre false sem token)' }),
  createdAt: z.iso.datetime(),
});
export type PostSummary = z.infer<typeof postSummarySchema>;

export const postDetailSchema = postSummarySchema.extend({
  code: z.string().nullable().meta({ description: 'Trecho de código do post' }),
});
export type PostDetail = z.infer<typeof postDetailSchema>;

export const postListSchema = z.object({
  items: z.array(postSummarySchema),
  total: z.number().int().meta({ description: 'Total de posts que atendem aos filtros' }),
  page: z.number().int(),
  limit: z.number().int(),
});
export type PostList = z.infer<typeof postListSchema>;

export const likeResponseSchema = z.object({
  likesCount: z.number().int(),
  likedByMe: z.boolean(),
});
export type LikeResponse = z.infer<typeof likeResponseSchema>;

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export const listTagsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
export type ListTagsQuery = z.infer<typeof listTagsQuerySchema>;

export const tagListSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().meta({ example: 'react' }),
      count: z.number().int().meta({ description: 'Quantidade de posts com a tag' }),
    }),
  ),
});
export type TagList = z.infer<typeof tagListSchema>;

// ---------------------------------------------------------------------------
// Comentários
// ---------------------------------------------------------------------------

export const createCommentSchema = z.object({
  content: z
    .string({ error: requiredError })
    .trim()
    .min(1)
    .max(1000)
    .meta({ description: 'Texto do comentário', example: 'Achei muito bom seu código, parabéns!' }),
  parentId: z
    .uuid()
    .optional()
    .meta({ description: 'Comentário respondido. Omitido em um comentário novo.' }),
});
export type CreateCommentRequest = z.infer<typeof createCommentSchema>;

export const commentResponseSchema = z.object({
  id: z.uuid(),
  postId: z.uuid(),
  parentId: z.uuid().nullable().meta({ description: 'Null nos comentários raiz' }),
  content: z.string(),
  author: authorSchema,
  createdAt: z.iso.datetime(),
});
export type CommentResponse = z.infer<typeof commentResponseSchema>;

export const commentListSchema = z.object({
  items: z
    .array(commentResponseSchema)
    .meta({ description: 'Do mais antigo ao mais novo. As respostas trazem `parentId`.' }),
});
export type CommentList = z.infer<typeof commentListSchema>;
