import type { Comment, PostDetail, PostSummary } from '../services/posts'

/** Post de exemplo para os testes das páginas. */
export function makePost(overrides: Partial<PostDetail> = {}): PostDetail {
  return {
    id: 'p1',
    title: 'React zero to hero',
    description: 'Um projeto de estudo com hooks.',
    thumbnailUrl: null,
    tags: ['react'],
    author: { id: 'u1', name: 'Júlio Andrade' },
    likesCount: 2,
    commentsCount: 1,
    likedByMe: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    code: null,
    ...overrides,
  }
}

export function makeSummary(overrides: Partial<PostSummary> = {}): PostSummary {
  const { code: _code, ...summary } = makePost(overrides)
  return summary
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 'c1',
    postId: 'p1',
    parentId: null,
    content: 'Achei muito bom seu código!',
    author: { id: 'u2', name: 'Márcia Lima' },
    createdAt: '2026-01-02T00:00:00.000Z',
    ...overrides,
  }
}
