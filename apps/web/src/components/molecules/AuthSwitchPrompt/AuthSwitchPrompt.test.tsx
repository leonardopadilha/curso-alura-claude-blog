import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AuthSwitchPrompt } from './AuthSwitchPrompt'

describe('AuthSwitchPrompt', () => {
  it('renders the question and a link to the target route', () => {
    render(
      <MemoryRouter>
        <AuthSwitchPrompt
          question="Ainda não tem conta?"
          linkLabel="Crie seu cadastro!"
          to="/cadastro"
        />
      </MemoryRouter>,
    )
    expect(screen.getByText('Ainda não tem conta?')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Crie seu cadastro!' }),
    ).toHaveAttribute('href', '/cadastro')
  })
})
