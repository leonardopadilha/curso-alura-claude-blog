import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { vi } from 'vitest'
import {
  createComment,
  getPost,
  likePost,
  listComments,
  unlikePost,
} from '../../../services/posts'
import { setToken } from '../../../services/tokenStorage'
import { makeComment, makePost } from '../../../test/fixtures'
import { PostPage } from './PostPage'

vi.mock('../../../services/posts', () => ({
  getPost: vi.fn(),
  listComments: vi.fn(),
  createComment: vi.fn(),
  likePost: vi.fn(),
  unlikePost: vi.fn(),
}))

function LoginScreen() {
  const location = useLocation()
  return <p>{`Login (volta para ${(location.state as { from?: string })?.from})`}</p>
}

function renderPost() {
  return render(
    <MemoryRouter initialEntries={['/posts/p1']}>
      <Routes>
        <Route path="/" element={<p>Feed</p>} />
        <Route path="/posts/:id" element={<PostPage />} />
        <Route path="/login" element={<LoginScreen />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PostPage', () => {
  beforeEach(() => {
    vi.mocked(getPost).mockReset().mockResolvedValue(makePost({ code: 'const a = 1' }))
    vi.mocked(listComments).mockReset().mockResolvedValue([makeComment()])
    vi.mocked(createComment).mockReset()
    vi.mocked(likePost).mockReset()
    vi.mocked(unlikePost).mockReset()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('shows the post, its code and its comments to visitors', async () => {
    renderPost()

    expect(screen.getByText('Carregando post…')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 1, name: 'React zero to hero' })).toBeInTheDocument()
    expect(screen.getByText('Um projeto de estudo com hooks.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Código:' })).toBeInTheDocument()
    expect(screen.getByText('const a = 1')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Comentários' })).toBeInTheDocument()
    expect(screen.getByText('Achei muito bom seu código!')).toBeInTheDocument()
    expect(getPost).toHaveBeenCalledWith('p1')
    expect(document.title).toBe('React zero to hero | Code Connect')
  })

  it('has no code section when the post has no code', async () => {
    vi.mocked(getPost).mockResolvedValue(makePost({ code: null }))
    renderPost()

    await screen.findByRole('heading', { level: 1 })
    expect(screen.queryByRole('heading', { name: 'Código:' })).not.toBeInTheDocument()
  })

  it('shows the placeholder when the post has no thumbnail', async () => {
    renderPost()
    expect(await screen.findByRole('img', { name: 'Post sem imagem' })).toBeInTheDocument()
  })

  it('shows a message and a way back when the post does not exist', async () => {
    const { AxiosError } = await import('axios')
    vi.mocked(getPost).mockRejectedValue(
      new AxiosError('fail', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 404,
        data: {},
        statusText: '',
        headers: {},
        config: {} as never,
      }),
    )
    renderPost()

    expect(await screen.findByRole('alert')).toHaveTextContent('Não encontramos o que você procura.')
    await userEvent.click(screen.getByRole('link', { name: 'Voltar ao feed' }))
    expect(screen.getByText('Feed')).toBeInTheDocument()
  })

  describe('as a visitor', () => {
    it('cannot comment: shows a login link instead of the form', async () => {
      renderPost()
      await screen.findByRole('heading', { level: 1 })

      expect(screen.queryByLabelText('Escreva um comentário')).not.toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Entre' })).toHaveAttribute('href', '/login')
    })

    it('cannot like: is sent to the login and comes back to the post', async () => {
      renderPost()
      await userEvent.click(await screen.findByRole('button', { name: 'Curtir (2)' }))

      expect(await screen.findByText('Login (volta para /posts/p1)')).toBeInTheDocument()
      expect(likePost).not.toHaveBeenCalled()
    })
  })

  describe('as a logged user', () => {
    beforeEach(() => setToken('jwt', false))

    it('likes the post', async () => {
      vi.mocked(likePost).mockResolvedValue({ likesCount: 3, likedByMe: true })
      renderPost()

      await userEvent.click(await screen.findByRole('button', { name: 'Curtir (2)' }))

      expect(likePost).toHaveBeenCalledWith('p1')
      expect(await screen.findByRole('button', { name: 'Remover curtida (3)' })).toBeInTheDocument()
    })

    it('comments and shows the new comment with the updated counter', async () => {
      vi.mocked(createComment).mockResolvedValue(
        makeComment({ id: 'c2', content: 'Muito bom!', author: { id: 'u1', name: 'Júlio Andrade' } }),
      )
      renderPost()

      await userEvent.type(await screen.findByLabelText('Escreva um comentário'), 'Muito bom!')
      await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))

      expect(createComment).toHaveBeenCalledWith('p1', { content: 'Muito bom!', parentId: undefined })
      expect(await screen.findByText('Muito bom!')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Comentários (2)' })).toBeInTheDocument()
    })

    it('replies to a comment', async () => {
      vi.mocked(createComment).mockResolvedValue(
        makeComment({ id: 'c2', parentId: 'c1', content: 'Obrigado!', author: { id: 'u1', name: 'Júlio Andrade' } }),
      )
      renderPost()

      await userEvent.click(await screen.findByRole('button', { name: 'Responder' }))
      await userEvent.type(screen.getByLabelText('Responder a Márcia Lima'), 'Obrigado!')
      const form = screen.getByLabelText('Responder a Márcia Lima').closest('form')!
      await userEvent.click(form.querySelector<HTMLButtonElement>('button[type="submit"]')!)

      expect(createComment).toHaveBeenCalledWith('p1', { content: 'Obrigado!', parentId: 'c1' })
      expect(await screen.findByText('Obrigado!')).toBeInTheDocument()
    })

    it('shows an error in the form when the comment cannot be sent', async () => {
      vi.mocked(createComment).mockRejectedValue(new Error('boom'))
      renderPost()

      await userEvent.type(await screen.findByLabelText('Escreva um comentário'), 'Oi')
      await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))

      expect(await screen.findByRole('alert')).toBeInTheDocument()
    })
  })
})
