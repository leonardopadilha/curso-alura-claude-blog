import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { vi } from 'vitest'
import { SideMenu } from './SideMenu'

function Where() {
  const location = useLocation()
  return <p data-testid="where">{`${location.pathname}|${JSON.stringify(location.state)}`}</p>
}

function renderMenu(isLoggedIn: boolean, onLogout = vi.fn(), initialPath = '/') {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <SideMenu isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <Routes>
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  )
  return onLogout
}

describe('SideMenu', () => {
  it('shows the logo, the main links and the "Sair" item when logged in', () => {
    renderMenu(true)

    expect(screen.getByRole('navigation', { name: 'Menu principal' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Code Connect' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Feed' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()
  })

  it('shows "Login" instead of "Sair" for visitors', () => {
    renderMenu(false)

    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login')
    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument()
  })

  it('logs out when "Sair" is clicked', async () => {
    const onLogout = renderMenu(true)

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))
    expect(onLogout).toHaveBeenCalledOnce()
  })

  it('goes to the publish page when logged in', async () => {
    renderMenu(true)

    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))
    expect(screen.getByTestId('where')).toHaveTextContent('/publicar|null')
  })

  it('sends visitors to login and back to the publish page afterwards', async () => {
    renderMenu(false)

    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))
    expect(screen.getByTestId('where')).toHaveTextContent('/login|{"from":"/publicar"}')
  })

  it('marks the feed as the current page on the feed and on post pages', () => {
    renderMenu(true, vi.fn(), '/posts/123')
    expect(screen.getByRole('link', { name: 'Feed' })).toHaveAttribute('aria-current', 'page')
  })

  it('does not mark the feed on other pages', () => {
    renderMenu(true, vi.fn(), '/publicar')
    expect(screen.getByRole('link', { name: 'Feed' })).not.toHaveAttribute('aria-current')
  })

  it('keeps the pages that do not exist yet disabled', () => {
    renderMenu(true)
    expect(screen.getByText('Perfil').closest('[aria-disabled]')).toBeInTheDocument()
    expect(screen.getByText('Sobre nós').closest('[aria-disabled]')).toBeInTheDocument()
  })
})
