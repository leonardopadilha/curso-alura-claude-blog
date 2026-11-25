import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import type { Comment } from '../../../services/posts'
import { CommentSection } from './CommentSection'

function makeComment(id: string, content: string, parentId: string | null, name = 'Ana'): Comment {
  return {
    id,
    postId: 'p1',
    parentId,
    content,
    author: { id: `u-${name}`, name },
    createdAt: '2026-01-01T00:00:00.000Z',
  }
}

const comments = [
  makeComment('c1', 'Achei muito bom!', null, 'Márcia'),
  makeComment('c2', 'Obrigado!', 'c1', 'Júlio'),
  makeComment('c3', 'Quanto tempo levou?', null, 'Gabriel'),
]

function renderSection(
  props: Partial<Parameters<typeof CommentSection>[0]> = {},
  initialPath = '/posts/p1',
) {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <CommentSection comments={comments} isLoggedIn onSubmit={onSubmit} {...props} />
    </MemoryRouter>,
  )
  return { onSubmit }
}

describe('CommentSection', () => {
  it('lists the root comments under the "Comentários" heading', () => {
    renderSection()

    expect(screen.getByRole('heading', { name: 'Comentários' })).toBeInTheDocument()
    expect(screen.getByText('Achei muito bom!')).toBeInTheDocument()
    expect(screen.getByText('Quanto tempo levou?')).toBeInTheDocument()
    expect(screen.getByText('@marcia')).toBeInTheDocument()
  })

  it('hides replies until "Ver respostas" is clicked, then hides them again', async () => {
    renderSection()
    expect(screen.queryByText('Obrigado!')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Ver respostas (1)' }))
    expect(screen.getByText('Obrigado!')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Ocultar respostas' }))
    expect(screen.queryByText('Obrigado!')).not.toBeInTheDocument()
  })

  it('shows a message when there are no comments', () => {
    renderSection({ comments: [] })
    expect(screen.getByText(/Ainda não há comentários/)).toBeInTheDocument()
  })

  it('lets a logged user comment and clears the field', async () => {
    const { onSubmit } = renderSection()

    const field = screen.getByLabelText('Escreva um comentário')
    await userEvent.type(field, '  Muito legal!  ')
    await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))

    expect(onSubmit).toHaveBeenCalledWith('Muito legal!')
    expect(field).toHaveValue('')
  })

  it('does not send an empty comment', async () => {
    const { onSubmit } = renderSection()
    await userEvent.type(screen.getByLabelText('Escreva um comentário'), '   ')
    await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('replies to a comment and shows the replies afterwards', async () => {
    const { onSubmit } = renderSection()

    await userEvent.click(screen.getAllByRole('button', { name: 'Responder' })[1])
    const field = screen.getByLabelText('Responder a Gabriel')
    await userEvent.type(field, 'Uns 3 dias')
    await userEvent.click(within(field.closest('form')!).getByRole('button', { name: 'Responder' }))

    expect(onSubmit).toHaveBeenCalledWith('Uns 3 dias', 'c3')
    expect(screen.queryByLabelText('Responder a Gabriel')).not.toBeInTheDocument()
  })

  it('can cancel a reply', async () => {
    renderSection()
    await userEvent.click(screen.getAllByRole('button', { name: 'Responder' })[0])
    expect(screen.getByLabelText('Responder a Márcia')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByLabelText('Responder a Márcia')).not.toBeInTheDocument()
  })

  it('shows an error and keeps the text when sending fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('boom'))
    renderSection({ onSubmit })

    const field = screen.getByLabelText('Escreva um comentário')
    await userEvent.type(field, 'Oi')
    await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(field).toHaveValue('Oi')
  })

  it('does not let visitors comment or reply, and links to the login', () => {
    renderSection({ isLoggedIn: false })

    expect(screen.queryByLabelText('Escreva um comentário')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Responder' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Entre' })).toHaveAttribute('href', '/login')
    expect(screen.getByText('Achei muito bom!')).toBeInTheDocument()
  })
})
