import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import type { Comment } from '../../../services/posts'
import { CommentItem } from './CommentItem'

const comment: Comment = {
  id: 'c1',
  postId: 'p1',
  parentId: null,
  content: 'Achei muito bom seu código!',
  author: { id: 'u1', name: 'Márcia Lima' },
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('CommentItem', () => {
  it('shows the author handle and the comment text', () => {
    render(<CommentItem comment={comment} />)
    expect(screen.getByText('@marcia')).toBeInTheDocument()
    expect(screen.getByText('Achei muito bom seu código!')).toBeInTheDocument()
  })

  it('has no reply button without onReply (visitors)', () => {
    render(<CommentItem comment={comment} />)
    expect(screen.queryByRole('button', { name: 'Responder' })).not.toBeInTheDocument()
  })

  it('lets the user reply', async () => {
    const onReply = vi.fn()
    render(<CommentItem comment={comment} onReply={onReply} />)

    await userEvent.click(screen.getByRole('button', { name: 'Responder' }))
    expect(onReply).toHaveBeenCalledOnce()
  })
})
