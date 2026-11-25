import { vi } from 'vitest'
import { clearToken, getToken, setToken, subscribeToken } from './tokenStorage'

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

  it('notifies subscribers when the token changes, until they unsubscribe', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToken(listener)

    setToken('abc', true)
    clearToken()
    expect(listener).toHaveBeenCalledTimes(3) // setToken limpa e grava; clearToken avisa de novo

    unsubscribe()
    setToken('def', true)
    expect(listener).toHaveBeenCalledTimes(3)
  })
})
