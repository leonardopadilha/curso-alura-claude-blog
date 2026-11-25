import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import type { PostSummary } from '../../../services/posts'
import { PostGrid } from './PostGrid'

function makePost(id: string, title: string): PostSummary {
  return {
    id,
    title,
    description: `Descrição de ${title}`,
    thumbnailUrl: null,
    tags: [],
    author: { id: 'u1', name: 'Ana' },
    likesCount: 0,
    commentsCount: 0,
    likedByMe: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('PostGrid', () => {
  it('renders one card per post', () => {
    render(
      <MemoryRouter>
        <PostGrid posts={[makePost('1', 'Primeiro'), makePost('2', 'Segundo')]} onLike={() => {}} />
      </MemoryRouter>,
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Primeiro' })).toHaveAttribute('href', '/posts/1')
    expect(screen.getByRole('link', { name: 'Segundo' })).toHaveAttribute('href', '/posts/2')
  })

  it('passes the like action of a card to the page', async () => {
    const onLike = vi.fn()
    const post = makePost('1', 'Primeiro')
    render(
      <MemoryRouter>
        <PostGrid posts={[post]} onLike={onLike} />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Curtir (0)' }))
    expect(onLike).toHaveBeenCalledWith(post)
  })

  it('shows a message when there are no posts', () => {
    render(
      <MemoryRouter>
        <PostGrid posts={[]} onLike={() => {}} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Nenhum post encontrado.')).toBeInTheDocument()
  })
})
