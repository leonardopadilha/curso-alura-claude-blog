import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'
import { login } from '../../../services/auth'
import { getToken } from '../../../services/tokenStorage'
import { LoginPage } from './LoginPage'

vi.mock('../../../services/auth', () => ({ login: vi.fn() }))

function renderPage(initialEntry: string | { pathname: string; state: unknown } = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<p>Página inicial</p>} />
        <Route path="/publicar" element={<p>Tela de publicação</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText('Email'), 'ana@exemplo.com')
  await userEvent.type(screen.getByLabelText('Senha'), 'segredo123')
  await userEvent.click(screen.getByRole('button', { name: 'Login' }))
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(login).mockReset()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('renders the login form, social login and signup link', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Github' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Crie seu cadastro!' }),
    ).toHaveAttribute('href', '/cadastro')
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('logs in, stores the token and goes to the feed', async () => {
    vi.mocked(login).mockResolvedValue({
      accessToken: 'jwt-123',
      tokenType: 'Bearer',
      expiresIn: 900,
    })
    renderPage()
    await fillAndSubmit()

    expect(await screen.findByText('Página inicial')).toBeInTheDocument()
    expect(login).toHaveBeenCalledWith({
      email: 'ana@exemplo.com',
      password: 'segredo123',
    })
    expect(getToken()).toBe('jwt-123')
  })

  it('goes back to the page the user came from after logging in', async () => {
    vi.mocked(login).mockResolvedValue({
      accessToken: 'jwt-123',
      tokenType: 'Bearer',
      expiresIn: 900,
    })
    renderPage({ pathname: '/login', state: { from: '/publicar' } })
    await fillAndSubmit()

    expect(await screen.findByText('Tela de publicação')).toBeInTheDocument()
  })

  it('shows an error and stays on the page when the login fails', async () => {
    vi.mocked(login).mockRejectedValue(new Error('boom'))
    renderPage()
    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.queryByText('Página inicial')).not.toBeInTheDocument()
    expect(getToken()).toBeNull()
  })
})
