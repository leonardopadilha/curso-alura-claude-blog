import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('renders with the given type and placeholder', () => {
    render(<Input type="password" placeholder="Senha" />)
    expect(screen.getByPlaceholderText('Senha')).toHaveAttribute(
      'type',
      'password',
    )
  })

  it('calls onChange when typing', async () => {
    const onChange = vi.fn()
    render(<Input aria-label="campo" onChange={onChange} />)
    await userEvent.type(screen.getByLabelText('campo'), 'ab')
    expect(onChange).toHaveBeenCalledTimes(2)
  })
})
