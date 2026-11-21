import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'
import { getCurrentUser } from '../../../services/auth'
import { getToken, setToken } from '../../../services/tokenStorage'
import { HomePage } from './HomePage'

// Só `getCurrentUser` é simulado; `logout` real limpa o token.
vi.mock('../../../services/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../services/auth')>()),
  getCurrentUser: vi.fn(),
}))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/inicio']}>
      <Routes>
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/login" element={<p>Tela de login</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(getCurrentUser).mockReset()
    localStorage.clear()
    sessionStorage.clear()
    setToken('jwt', false)
  })

  it('greets the logged-in user', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: '1',
      name: 'Ana Souza',
      email: 'ana@exemplo.com',
    })
    renderPage()
    expect(await screen.findByRole('heading', { name: 'Olá, Ana Souza' })).toBeInTheDocument()
    expect(screen.getByText('ana@exemplo.com')).toBeInTheDocument()
  })

  it('clears the token and goes to /login on "Sair"', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: '1',
      name: 'Ana',
      email: 'ana@exemplo.com',
    })
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: 'Sair' }))
    expect(await screen.findByText('Tela de login')).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })

  it('clears the token and goes to /login when the API answers 401', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(
      new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 401,
      } as never),
    )
    renderPage()
    expect(await screen.findByText('Tela de login')).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })
})
