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

  it('stacks question and link by default and puts them in one row when inline', () => {
    const props = { question: 'Já tem conta?', linkLabel: 'Faça seu login!', to: '/login' }
    const { container, rerender } = render(
      <MemoryRouter>
        <AuthSwitchPrompt {...props} />
      </MemoryRouter>,
    )
    expect(container.firstElementChild).toHaveClass('flex-col')

    rerender(
      <MemoryRouter>
        <AuthSwitchPrompt {...props} layout="inline" />
      </MemoryRouter>,
    )
    expect(container.firstElementChild).not.toHaveClass('flex-col')
  })
})
