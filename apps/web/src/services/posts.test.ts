import { vi } from 'vitest'
import { api } from './api'
import {
  createComment,
  createPost,
  getPost,
  likePost,
  listComments,
  listPosts,
  listTags,
  unlikePost,
  uploadImage,
} from './posts'

vi.mock('./api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

describe('posts service', () => {
  beforeEach(() => {
    for (const method of [api.get, api.post, api.put, api.delete]) vi.mocked(method).mockReset()
  })

  it('listPosts sends only the filters that are set', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { items: [], total: 0, page: 1, limit: 12 } })

    await listPosts({ search: 'react', tags: ['css', 'front-end'], sort: 'popular', page: 2 })
    expect(api.get).toHaveBeenLastCalledWith('/posts', {
      params: { search: 'react', tags: 'css,front-end', sort: 'popular', page: 2, limit: undefined },
    })

    await listPosts({ search: '', tags: [] })
    expect(api.get).toHaveBeenLastCalledWith('/posts', {
      params: { search: undefined, tags: undefined, sort: undefined, page: undefined, limit: undefined },
    })
  })

  it('getPost gets /posts/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { id: 'p1' } })
    await expect(getPost('p1')).resolves.toEqual({ id: 'p1' })
    expect(api.get).toHaveBeenCalledWith('/posts/p1')
  })

  it('createPost posts to /posts', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'p1' } })
    const payload = { title: 'T', description: 'D', tags: ['react'] }
    await expect(createPost(payload)).resolves.toEqual({ id: 'p1' })
    expect(api.post).toHaveBeenCalledWith('/posts', payload)
  })

  it('likePost puts and unlikePost deletes /posts/:id/likes/me', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { likesCount: 1, likedByMe: true } })
    vi.mocked(api.delete).mockResolvedValue({ data: { likesCount: 0, likedByMe: false } })

    await expect(likePost('p1')).resolves.toEqual({ likesCount: 1, likedByMe: true })
    await expect(unlikePost('p1')).resolves.toEqual({ likesCount: 0, likedByMe: false })
    expect(api.put).toHaveBeenCalledWith('/posts/p1/likes/me')
    expect(api.delete).toHaveBeenCalledWith('/posts/p1/likes/me')
  })

  it('listComments returns the items and createComment posts the comment', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { items: [{ id: 'c1' }] } })
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'c2' } })

    await expect(listComments('p1')).resolves.toEqual([{ id: 'c1' }])
    expect(api.get).toHaveBeenCalledWith('/posts/p1/comments')
    await expect(createComment('p1', { content: 'oi', parentId: 'c1' })).resolves.toEqual({
      id: 'c2',
    })
    expect(api.post).toHaveBeenCalledWith('/posts/p1/comments', { content: 'oi', parentId: 'c1' })
  })

  it('listTags returns the items', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { items: [{ name: 'react', count: 2 }] } })
    await expect(listTags(5)).resolves.toEqual([{ name: 'react', count: 2 }])
    expect(api.get).toHaveBeenCalledWith('/tags', { params: { limit: 5 } })
  })

  it('uploadImage sends the file as multipart and returns the url', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { url: '/uploads/a.png' } })
    const file = new File(['x'], 'capa.png', { type: 'image/png' })

    await expect(uploadImage(file)).resolves.toBe('/uploads/a.png')

    const [path, body, config] = vi.mocked(api.post).mock.calls[0]
    expect(path).toBe('/uploads')
    expect((body as FormData).get('file')).toBe(file)
    expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } })
  })
})
