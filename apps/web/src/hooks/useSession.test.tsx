import { act, renderHook } from '@testing-library/react'
import { clearToken, setToken } from '../services/tokenStorage'
import { useSession } from './useSession'

describe('useSession', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('is logged out without a token', () => {
    const { result } = renderHook(() => useSession())
    expect(result.current.isLoggedIn).toBe(false)
  })

  it('follows login and logout', () => {
    const { result } = renderHook(() => useSession())

    act(() => setToken('jwt', false))
    expect(result.current.isLoggedIn).toBe(true)

    act(() => clearToken())
    expect(result.current.isLoggedIn).toBe(false)
  })
})
