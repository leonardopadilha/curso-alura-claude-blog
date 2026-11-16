import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import { LoginForm } from './LoginForm'

function setup(onSubmit = vi.fn()) {
  render(
    <MemoryRouter>
      <LoginForm onSubmit={onSubmit} />
    </MemoryRouter>,
  )
  return onSubmit
}

describe('LoginForm', () => {
  it('renders title, fields and forgot-password link', () => {
    setup()
    expect(
      screen.getByRole('heading', { name: 'Login' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email ou usuário')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Esqueci a senha' })).toBeInTheDocument()
  })

  it('submits the typed values', async () => {
    const onSubmit = setup()
    await userEvent.type(screen.getByLabelText('Email ou usuário'), 'ana')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(onSubmit).toHaveBeenCalledWith({
      identifier: 'ana',
      password: 'segredo',
      remember: true,
    })
  })

  it('does not submit with empty required fields', async () => {
    const onSubmit = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
