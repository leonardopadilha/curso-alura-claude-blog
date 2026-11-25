import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { vi } from 'vitest'
import { likePost, listPosts, listTags, unlikePost } from '../../../services/posts'
import { setToken } from '../../../services/tokenStorage'
import { makeSummary } from '../../../test/fixtures'
import { FeedPage } from './FeedPage'

vi.mock('../../../services/posts', () => ({
  listPosts: vi.fn(),
  listTags: vi.fn(),
  likePost: vi.fn(),
  unlikePost: vi.fn(),
}))

function LoginScreen() {
  const location = useLocation()
  return <p>{`Login (volta para ${(location.state as { from?: string })?.from})`}</p>
}

function renderFeed(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/login" element={<LoginScreen />} />
      </Routes>
    </MemoryRouter>,
  )
}

const react = makeSummary({ id: 'p1', title: 'Post de React', likesCount: 2 })
const css = makeSummary({ id: 'p2', title: 'Post de CSS', likesCount: 0 })

function lastParams() {
  return vi.mocked(listPosts).mock.lastCall?.[0]
}

describe('FeedPage', () => {
  beforeEach(() => {
    vi.mocked(listPosts).mockReset().mockResolvedValue({ items: [react, css], total: 2, page: 1, limit: 12 })
    vi.mocked(listTags).mockReset().mockResolvedValue([
      { name: 'react', count: 3 },
      { name: 'css', count: 1 },
    ])
    vi.mocked(likePost).mockReset()
    vi.mocked(unlikePost).mockReset()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('shows the posts and the suggested tags to visitors', async () => {
    renderFeed()

    expect(screen.getByText('Carregando posts…')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Post de React' })).toHaveAttribute('href', '/posts/p1')
    expect(screen.getByRole('link', { name: 'Post de CSS' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'react' })).toBeInTheDocument()
    expect(lastParams()).toMatchObject({ search: '', tags: [], sort: 'recent', page: 1 })
  })

  it('searches on the backend after the user stops typing', async () => {
    renderFeed()
    await screen.findByRole('link', { name: 'Post de React' })

    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar posts' }), 'react')

    await waitFor(() => expect(lastParams()).toMatchObject({ search: 'react', page: 1 }))
    expect(listPosts).not.toHaveBeenCalledWith(expect.objectContaining({ search: 'rea' }))
  })

  it('reads the filters from the URL', async () => {
    renderFeed('/?q=hooks&tags=react,css&sort=popular')

    await screen.findByRole('link', { name: 'Post de React' })

    expect(lastParams()).toMatchObject({ search: 'hooks', tags: ['react', 'css'], sort: 'popular' })
    expect(screen.getByRole('searchbox')).toHaveValue('hooks')
    expect(screen.getByRole('tab', { name: 'Populares' })).toHaveAttribute('aria-selected', 'true')
  })

  it('filters by tag, and toggles it off again', async () => {
    renderFeed()
    await userEvent.click(await screen.findByRole('button', { name: 'react' }))

    await waitFor(() => expect(lastParams()).toMatchObject({ tags: ['react'] }))
    expect(screen.getByRole('button', { name: 'react' })).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(screen.getByRole('button', { name: 'react' }))
    await waitFor(() => expect(lastParams()).toMatchObject({ tags: [] }))
  })

  it('changes the order with the tabs', async () => {
    renderFeed()
    await screen.findByRole('link', { name: 'Post de React' })

    await userEvent.click(screen.getByRole('tab', { name: 'Populares' }))

    await waitFor(() => expect(lastParams()).toMatchObject({ sort: 'popular' }))
  })

  it('clears the search and the tags with "Limpar tudo"', async () => {
    renderFeed('/?q=hooks&tags=react')
    await screen.findByRole('link', { name: 'Post de React' })

    await userEvent.click(screen.getByRole('button', { name: 'Limpar tudo' }))

    await waitFor(() => expect(lastParams()).toMatchObject({ search: '', tags: [] }))
    expect(screen.getByRole('searchbox')).toHaveValue('')
  })

  it('loads more posts and appends them', async () => {
    vi.mocked(listPosts)
      .mockResolvedValueOnce({ items: [react], total: 2, page: 1, limit: 12 })
      .mockResolvedValueOnce({ items: [css], total: 2, page: 2, limit: 12 })
    renderFeed()
    await screen.findByRole('link', { name: 'Post de React' })

    await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))

    expect(await screen.findByRole('link', { name: 'Post de CSS' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Post de React' })).toBeInTheDocument()
    expect(lastParams()).toMatchObject({ page: 2 })
    expect(screen.queryByRole('button', { name: 'Carregar mais' })).not.toBeInTheDocument()
  })

  it('shows a message when nothing matches', async () => {
    vi.mocked(listPosts).mockResolvedValue({ items: [], total: 0, page: 1, limit: 12 })
    renderFeed()
    expect(await screen.findByText('Nenhum post encontrado.')).toBeInTheDocument()
  })

  it('shows an error when the posts cannot be loaded', async () => {
    vi.mocked(listPosts).mockRejectedValue(new Error('boom'))
    renderFeed()
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('keeps working without the tag suggestions', async () => {
    vi.mocked(listTags).mockRejectedValue(new Error('boom'))
    renderFeed()
    expect(await screen.findByRole('link', { name: 'Post de React' })).toBeInTheDocument()
  })

  describe('as a visitor', () => {
    it('sends the visitor to the login when trying to like', async () => {
      renderFeed('/?q=react')
      await userEvent.click(await screen.findByRole('button', { name: 'Curtir (2)' }))

      expect(await screen.findByText('Login (volta para /?q=react)')).toBeInTheDocument()
      expect(likePost).not.toHaveBeenCalled()
    })
  })

  describe('as a logged user', () => {
    beforeEach(() => setToken('jwt', false))

    it('likes a post and updates the counter', async () => {
      vi.mocked(likePost).mockResolvedValue({ likesCount: 3, likedByMe: true })
      renderFeed()

      await userEvent.click(await screen.findByRole('button', { name: 'Curtir (2)' }))

      expect(likePost).toHaveBeenCalledWith('p1')
      expect(await screen.findByRole('button', { name: 'Remover curtida (3)' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })

    it('removes the like of a post already liked', async () => {
      vi.mocked(listPosts).mockResolvedValue({
        items: [{ ...react, likedByMe: true }],
        total: 1,
        page: 1,
        limit: 12,
      })
      vi.mocked(unlikePost).mockResolvedValue({ likesCount: 1, likedByMe: false })
      renderFeed()

      await userEvent.click(await screen.findByRole('button', { name: 'Remover curtida (2)' }))

      expect(unlikePost).toHaveBeenCalledWith('p1')
      expect(await screen.findByRole('button', { name: 'Curtir (1)' })).toBeInTheDocument()
    })

    it('goes to the login when the session has expired', async () => {
      const { AxiosError } = await import('axios')
      vi.mocked(likePost).mockRejectedValue(
        new AxiosError('fail', 'ERR_BAD_REQUEST', undefined, undefined, {
          status: 401,
          data: {},
          statusText: '',
          headers: {},
          config: {} as never,
        }),
      )
      renderFeed()

      await userEvent.click(await screen.findByRole('button', { name: 'Curtir (2)' }))

      expect(await screen.findByText(/^Login \(volta para/)).toBeInTheDocument()
      expect(localStorage.length + sessionStorage.length).toBe(0)
    })
  })
})
