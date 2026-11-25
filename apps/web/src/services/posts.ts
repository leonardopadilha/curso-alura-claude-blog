import { api } from './api'

// Tipos espelhando os schemas Zod de apps/api (posts/post.schema.ts).
export type Author = { id: string; name: string }

export type PostSummary = {
  id: string
  title: string
  description: string
  thumbnailUrl: string | null
  tags: string[]
  author: Author
  likesCount: number
  commentsCount: number
  likedByMe: boolean
  createdAt: string
}
export type PostDetail = PostSummary & { code: string | null }
export type PostList = { items: PostSummary[]; total: number; page: number; limit: number }
export type PostSort = 'recent' | 'popular'
export type LikeState = { likesCount: number; likedByMe: boolean }
export type TagCount = { name: string; count: number }

export type Comment = {
  id: string
  postId: string
  parentId: string | null
  content: string
  author: Author
  createdAt: string
}

export type ListPostsParams = {
  search?: string
  tags?: string[]
  sort?: PostSort
  page?: number
  limit?: number
}
export type CreatePostRequest = {
  title: string
  description: string
  code?: string
  thumbnailUrl?: string
  tags: string[]
}

export async function listPosts({ search, tags, sort, page, limit }: ListPostsParams = {}) {
  const response = await api.get<PostList>('/posts', {
    params: {
      search: search || undefined,
      tags: tags?.length ? tags.join(',') : undefined,
      sort,
      page,
      limit,
    },
  })
  return response.data
}

export async function getPost(id: string): Promise<PostDetail> {
  const response = await api.get<PostDetail>(`/posts/${id}`)
  return response.data
}

export async function createPost(data: CreatePostRequest): Promise<PostDetail> {
  const response = await api.post<PostDetail>('/posts', data)
  return response.data
}

export async function likePost(id: string): Promise<LikeState> {
  const response = await api.put<LikeState>(`/posts/${id}/likes/me`)
  return response.data
}

export async function unlikePost(id: string): Promise<LikeState> {
  const response = await api.delete<LikeState>(`/posts/${id}/likes/me`)
  return response.data
}

export async function listComments(postId: string): Promise<Comment[]> {
  const response = await api.get<{ items: Comment[] }>(`/posts/${postId}/comments`)
  return response.data.items
}

export async function createComment(
  postId: string,
  data: { content: string; parentId?: string },
): Promise<Comment> {
  const response = await api.post<Comment>(`/posts/${postId}/comments`, data)
  return response.data
}

export async function listTags(limit = 10): Promise<TagCount[]> {
  const response = await api.get<{ items: TagCount[] }>('/tags', { params: { limit } })
  return response.data.items
}

/** Envia a imagem e devolve o caminho público para usar como `thumbnailUrl`. */
export async function uploadImage(file: File): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  const response = await api.post<{ url: string }>('/uploads', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.url
}
