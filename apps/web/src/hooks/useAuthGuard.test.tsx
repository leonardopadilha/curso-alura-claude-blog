import { act, renderHook, screen } from '@testing-library/react'
import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { getToken, setToken } from '../services/tokenStorage'
import { useAuthGuard } from './useAuthGuard'

function httpError(status: number) {
  return new AxiosError('fail', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    data: {},
    statusText: '',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  })
}

/** Mostra onde o app está (caminho e state) para os testes conferirem. */
function CurrentLocation() {
  const location = useLocation()
  return <output data-testid="location">{`${location.pathname}|${JSON.stringify(location.state)}`}</output>
}

function wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={['/posts/p1?x=1']}>
      <CurrentLocation />
      <Routes>
        <Route path="*" element={children} />
      </Routes>
    </MemoryRouter>
  )
}

describe('useAuthGuard', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('redirects to /login remembering the current page', () => {
    const { result } = renderHook(() => useAuthGuard(), { wrapper })

    act(() => result.current.redirectToLogin())

    expect(screen.getByTestId('location')).toHaveTextContent('/login|{"from":"/posts/p1?x=1"}')
  })

  it('on 401 ends the session and sends the user to the login', () => {
    setToken('expirado', false)
    const { result } = renderHook(() => useAuthGuard(), { wrapper })

    let handled = false
    act(() => {
      handled = result.current.handleUnauthorized(httpError(401))
    })

    expect(handled).toBe(true)
    expect(getToken()).toBeNull()
    expect(screen.getByTestId('location')).toHaveTextContent('/login|')
  })

  it('leaves other errors alone', () => {
    setToken('valido', false)
    const { result } = renderHook(() => useAuthGuard(), { wrapper })

    expect(result.current.handleUnauthorized(httpError(500))).toBe(false)
    expect(result.current.handleUnauthorized(new Error('x'))).toBe(false)

    expect(getToken()).toBe('valido')
    expect(screen.getByTestId('location')).toHaveTextContent('/posts/p1|null')
  })
})
