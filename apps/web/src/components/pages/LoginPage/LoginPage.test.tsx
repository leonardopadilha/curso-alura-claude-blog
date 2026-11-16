import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  it('renders the login form, social login and signup link', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Github' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Crie seu cadastro!' }),
    ).toHaveAttribute('href', '/cadastro')
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})
