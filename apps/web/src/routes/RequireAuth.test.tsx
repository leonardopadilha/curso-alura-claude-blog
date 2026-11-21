import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { setToken } from '../services/tokenStorage'
import { RequireAuth } from './RequireAuth'

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={['/inicio']}>
      <Routes>
        <Route
          path="/inicio"
          element={
            <RequireAuth>
              <p>Conteúdo protegido</p>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<p>Tela de login</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('redirects to /login without a token', () => {
    renderGuard()
    expect(screen.getByText('Tela de login')).toBeInTheDocument()
  })

  it('renders the children with a token', () => {
    setToken('jwt', false)
    renderGuard()
    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument()
  })
})
