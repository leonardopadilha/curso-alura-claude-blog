import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextArea } from './TextArea'

describe('TextArea', () => {
  it('renders a textarea that accepts typing and props', async () => {
    render(<TextArea aria-label="Descrição" placeholder="Conte mais" rows={4} />)

    const textarea = screen.getByRole('textbox', { name: 'Descrição' })
    expect(textarea).toHaveAttribute('rows', '4')
    await userEvent.type(textarea, 'Olá')
    expect(textarea).toHaveValue('Olá')
  })

  it('merges extra classes', () => {
    render(<TextArea aria-label="x" className="bg-offwhite" />)
    expect(screen.getByRole('textbox')).toHaveClass('bg-offwhite')
  })
})
