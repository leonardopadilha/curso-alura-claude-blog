import { vi } from 'vitest'
import { api } from './api'
import { getCurrentUser, login, logout, signup } from './auth'
import { getToken, setToken } from './tokenStorage'

vi.mock('./api', () => ({ api: { post: vi.fn(), get: vi.fn() } }))

describe('auth service', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset()
    vi.mocked(api.get).mockReset()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('login posts to /auth/token and returns the token body', async () => {
    const body = { accessToken: 't', tokenType: 'Bearer', expiresIn: 900 }
    vi.mocked(api.post).mockResolvedValue({ data: body })
    const credentials = { email: 'ana@exemplo.com', password: 'segredo123' }

    await expect(login(credentials)).resolves.toEqual(body)
    expect(api.post).toHaveBeenCalledWith('/auth/token', credentials)
  })

  it('signup posts to /users and returns the user', async () => {
    const user = { id: '1', name: 'Ana', email: 'ana@exemplo.com' }
    vi.mocked(api.post).mockResolvedValue({ data: user })
    const payload = { name: 'Ana', email: 'ana@exemplo.com', password: 'segredo123' }

    await expect(signup(payload)).resolves.toEqual(user)
    expect(api.post).toHaveBeenCalledWith('/users', payload)
  })

  it('getCurrentUser gets /users/me', async () => {
    const user = { id: '1', name: 'Ana', email: 'ana@exemplo.com' }
    vi.mocked(api.get).mockResolvedValue({ data: user })

    await expect(getCurrentUser()).resolves.toEqual(user)
    expect(api.get).toHaveBeenCalledWith('/users/me')
  })

  it('logout clears the stored token', () => {
    setToken('jwt', true)
    logout()
    expect(getToken()).toBeNull()
  })
})
