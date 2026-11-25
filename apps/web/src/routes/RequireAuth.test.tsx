import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { setToken } from '../services/tokenStorage'
import { RequireAuth } from './RequireAuth'

function LoginScreen() {
  const location = useLocation()
  return <p>{`Tela de login (volta para ${JSON.stringify((location.state as { from?: string })?.from)})`}</p>
}

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={['/publicar?x=1']}>
      <Routes>
        <Route
          path="/publicar"
          element={
            <RequireAuth>
              <p>Conteúdo protegido</p>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<LoginScreen />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('redirects to /login without a token, remembering where the user was going', () => {
    renderGuard()
    expect(screen.getByText('Tela de login (volta para "/publicar?x=1")')).toBeInTheDocument()
  })

  it('renders the children with a token', () => {
    setToken('jwt', false)
    renderGuard()
    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument()
  })
})
