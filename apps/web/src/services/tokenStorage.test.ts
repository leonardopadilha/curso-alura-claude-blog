import { clearToken, getToken, setToken } from './tokenStorage'

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('returns null without a token', () => {
    expect(getToken()).toBeNull()
  })

  it('keeps the token in localStorage when "remember" is on', () => {
    setToken('abc', true)
    expect(getToken()).toBe('abc')
    expect(localStorage.length).toBe(1)
    expect(sessionStorage.length).toBe(0)
  })

  it('keeps the token in sessionStorage when "remember" is off', () => {
    setToken('abc', false)
    expect(getToken()).toBe('abc')
    expect(sessionStorage.length).toBe(1)
    expect(localStorage.length).toBe(0)
  })

  it('replaces a previous token and clears it', () => {
    setToken('old', true)
    setToken('new', false)
    expect(getToken()).toBe('new')
    clearToken()
    expect(getToken()).toBeNull()
  })
})
