import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextAreaField } from './TextAreaField'

describe('TextAreaField', () => {
  it('associates the label with the textarea', async () => {
    render(<TextAreaField label="Descrição" />)

    const textarea = screen.getByLabelText('Descrição')
    expect(textarea.tagName).toBe('TEXTAREA')
    await userEvent.type(textarea, 'Olá')
    expect(textarea).toHaveValue('Olá')
  })

  it('forwards props such as required', () => {
    render(<TextAreaField label="Descrição" required rows={5} />)
    expect(screen.getByLabelText('Descrição')).toBeRequired()
    expect(screen.getByLabelText('Descrição')).toHaveAttribute('rows', '5')
  })
})
