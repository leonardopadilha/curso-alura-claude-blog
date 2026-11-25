import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import App from './App'
import { setToken } from './services/tokenStorage'

vi.mock('./services/posts', () => ({
  listPosts: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 12 }),
  listTags: vi.fn().mockResolvedValue([]),
  getPost: vi.fn(),
  listComments: vi.fn(),
  createPost: vi.fn(),
  uploadImage: vi.fn(),
}))

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('shows the feed on / for visitors', async () => {
    renderApp('/')
    // Primeira rota lazy do arquivo: o import frio (com axios) passa de 1s.
    expect(
      await screen.findByRole('heading', { name: 'Feed de projetos' }, { timeout: 5000 }),
    ).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Menu principal' })).toBeInTheDocument()
  })

  it('redirects unknown routes to the feed', async () => {
    renderApp('/qualquer-coisa')
    expect(
      await screen.findByRole('heading', { name: 'Feed de projetos' }, { timeout: 5000 }),
    ).toBeInTheDocument()
  })

  it('renders the login page on /login', async () => {
    renderApp('/login')
    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument()
  })

  it('renders the signup page on /cadastro', async () => {
    renderApp('/cadastro')
    expect(await screen.findByRole('heading', { name: 'Cadastro' })).toBeInTheDocument()
  })

  it('sends visitors from /publicar to the login', async () => {
    renderApp('/publicar')
    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument()
  })

  it('lets logged users open /publicar inside the same layout', async () => {
    setToken('jwt', false)
    renderApp('/publicar')

    expect(await screen.findByRole('heading', { name: 'Novo projeto' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Menu principal' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  })
})
