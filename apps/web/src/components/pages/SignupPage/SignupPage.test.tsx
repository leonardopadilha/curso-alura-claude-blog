import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { SignupPage } from './SignupPage'

describe('SignupPage', () => {
  it('renders the signup form, social login and login link', () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Github' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Faça seu login!' })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})
