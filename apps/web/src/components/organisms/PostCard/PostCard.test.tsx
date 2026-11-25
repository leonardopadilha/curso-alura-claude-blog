import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import type { PostSummary } from '../../../services/posts'
import { PostCard } from './PostCard'

const post: PostSummary = {
  id: 'p1',
  title: 'React zero to hero',
  description: 'Um projeto de estudo com hooks.',
  thumbnailUrl: '/uploads/capa.png',
  tags: ['react', 'front-end'],
  author: { id: 'u1', name: 'Júlio Andrade' },
  likesCount: 12,
  commentsCount: 3,
  likedByMe: false,
  createdAt: '2026-01-01T00:00:00.000Z',
}

function renderCard(props: Partial<Parameters<typeof PostCard>[0]> = {}) {
  const onLike = vi.fn()
  render(
    <MemoryRouter>
      <PostCard post={post} onLike={onLike} {...props} />
    </MemoryRouter>,
  )
  return { onLike }
}

describe('PostCard', () => {
  it('shows cover, title link, description, tags, counters and author', () => {
    renderCard()

    expect(screen.getByRole('img', { name: 'Capa do post React zero to hero' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('React zero to hero')
    expect(screen.getByRole('link', { name: 'React zero to hero' })).toHaveAttribute('href', '/posts/p1')
    expect(screen.getByText('Um projeto de estudo com hooks.')).toBeInTheDocument()
    const tags = within(screen.getByRole('list', { name: 'Tags' }))
    expect(tags.getByText('react')).toBeInTheDocument()
    expect(tags.getByText('front-end')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Curtir (12)' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Comentários (3)' })).toHaveAttribute(
      'href',
      '/posts/p1#comentarios',
    )
    expect(screen.getByText('@julio')).toBeInTheDocument()
  })

  it('shows the placeholder when the post has no thumbnail', () => {
    renderCard({ post: { ...post, thumbnailUrl: null } })
    expect(screen.getByRole('img', { name: 'Post sem imagem' })).toBeInTheDocument()
  })

  it('reports the like with the post', async () => {
    const { onLike } = renderCard()
    await userEvent.click(screen.getByRole('button', { name: 'Curtir (12)' }))
    expect(onLike).toHaveBeenCalledWith(post)
  })

  it('shows the post as liked', () => {
    renderCard({ post: { ...post, likedByMe: true } })
    expect(screen.getByRole('button', { name: 'Remover curtida (12)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('only offers sharing when there is a handler, and reports it', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <PostCard post={post} onLike={() => {}} />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('button', { name: 'Compartilhar' })).not.toBeInTheDocument()

    const onShare = vi.fn()
    rerender(
      <MemoryRouter>
        <PostCard post={post} onLike={() => {}} onShare={onShare} />
      </MemoryRouter>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Compartilhar' }))
    expect(onShare).toHaveBeenCalledWith(post)
  })

  it('renders the title as the page heading, without a link, in the detail variant', () => {
    renderCard({ variant: 'detail' })

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('React zero to hero')
    expect(screen.queryByRole('link', { name: 'React zero to hero' })).not.toBeInTheDocument()
  })
})
