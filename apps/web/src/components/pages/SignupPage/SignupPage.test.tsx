import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'
import { login, signup } from '../../../services/auth'
import { getToken } from '../../../services/tokenStorage'
import { SignupPage } from './SignupPage'

vi.mock('../../../services/auth', () => ({ login: vi.fn(), signup: vi.fn() }))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/cadastro']}>
      <Routes>
        <Route path="/cadastro" element={<SignupPage />} />
        <Route path="/inicio" element={<p>Página inicial</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText('Nome'), 'Ana Souza')
  await userEvent.type(screen.getByLabelText('Email'), 'ana@exemplo.com')
  await userEvent.type(screen.getByLabelText('Senha'), 'segredo123')
  await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
}

describe('SignupPage', () => {
  beforeEach(() => {
    vi.mocked(login).mockReset()
    vi.mocked(signup).mockReset()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('renders the signup form, social login and login link', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Github' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Faça seu login!' })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('signs up, logs in automatically and goes to /inicio', async () => {
    vi.mocked(signup).mockResolvedValue({
      id: '1',
      name: 'Ana Souza',
      email: 'ana@exemplo.com',
    })
    vi.mocked(login).mockResolvedValue({
      accessToken: 'jwt-456',
      tokenType: 'Bearer',
      expiresIn: 900,
    })
    renderPage()
    await fillAndSubmit()

    expect(await screen.findByText('Página inicial')).toBeInTheDocument()
    expect(signup).toHaveBeenCalledWith({
      name: 'Ana Souza',
      email: 'ana@exemplo.com',
      password: 'segredo123',
    })
    expect(login).toHaveBeenCalledWith({
      email: 'ana@exemplo.com',
      password: 'segredo123',
    })
    expect(getToken()).toBe('jwt-456')
  })

  it('shows an error and does not log in when the signup fails', async () => {
    vi.mocked(signup).mockRejectedValue(new Error('boom'))
    renderPage()
    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
    expect(getToken()).toBeNull()
  })
})
