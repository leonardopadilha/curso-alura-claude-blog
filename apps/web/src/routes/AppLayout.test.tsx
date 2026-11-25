import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { getToken, setToken } from '../services/tokenStorage'
import { AppLayout } from './AppLayout'

function renderLayout(initialPath = '/outra') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<h1>Feed</h1>} />
          <Route path="outra" element={<h1>Outra página</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AppLayout', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('wraps every page with the menu', () => {
    renderLayout()
    expect(screen.getByRole('navigation', { name: 'Menu principal' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Outra página' })).toBeInTheDocument()
  })

  it('offers "Login" to visitors', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument()
  })

  it('switches from "Sair" to "Login" when the user logs out, going to the feed', async () => {
    setToken('jwt', false)
    renderLayout()

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))

    expect(getToken()).toBeNull()
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Feed' })).toBeInTheDocument()
  })
})
