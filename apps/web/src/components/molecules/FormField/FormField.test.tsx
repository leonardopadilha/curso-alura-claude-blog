import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormField } from './FormField'

describe('FormField', () => {
  it('associates the label with the input', () => {
    render(<FormField label="Email ou usuário" />)
    expect(screen.getByLabelText('Email ou usuário')).toBeInTheDocument()
  })

  it('forwards input props', async () => {
    render(<FormField label="Senha" type="password" />)
    const input = screen.getByLabelText('Senha')
    expect(input).toHaveAttribute('type', 'password')
    await userEvent.type(input, 'abc')
    expect(input).toHaveValue('abc')
  })
})
