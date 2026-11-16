import { render, screen } from '@testing-library/react'
import { Text } from './Text'

describe('Text', () => {
  it('renders the content with the default size', () => {
    render(<Text>Olá</Text>)
    expect(screen.getByText('Olá')).toHaveClass('text-sm')
  })

  it('applies the xs size', () => {
    render(<Text size="xs">Olá</Text>)
    expect(screen.getByText('Olá')).toHaveClass('text-xs')
  })
})
