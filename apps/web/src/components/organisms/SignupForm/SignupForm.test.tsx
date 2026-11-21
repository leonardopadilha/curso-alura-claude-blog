import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { SignupForm } from './SignupForm'

function setup(
  onSubmit = vi.fn(),
  props: { error?: string; submitting?: boolean } = {},
) {
  render(<SignupForm onSubmit={onSubmit} {...props} />)
  return onSubmit
}

describe('SignupForm', () => {
  it('renders title, fields and submit button', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument()
  })

  it('submits the typed values', async () => {
    const onSubmit = setup()
    await userEvent.type(screen.getByLabelText('Nome'), 'Ana Souza')
    await userEvent.type(screen.getByLabelText('Email'), 'ana@exemplo.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo123')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Ana Souza',
      email: 'ana@exemplo.com',
      password: 'segredo123',
      remember: true,
    })
  })

  it('shows the error as an alert', () => {
    setup(vi.fn(), { error: 'Já existe uma conta com esse email.' })
    expect(screen.getByRole('alert')).toHaveTextContent('Já existe uma conta com esse email.')
  })

  it('disables the button while submitting', () => {
    setup(vi.fn(), { submitting: true })
    expect(screen.getByRole('button', { name: 'Cadastrando…' })).toBeDisabled()
  })

  it('requires at least 8 characters in the password', () => {
    setup()
    expect(screen.getByLabelText('Senha')).toHaveAttribute('minlength', '8')
  })

  it('does not submit with empty required fields', async () => {
    const onSubmit = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
