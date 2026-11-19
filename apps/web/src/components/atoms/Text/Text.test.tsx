import { render, screen } from '@testing-library/react'
import { Text } from './Text'

describe('Text', () => {
  it('renders the content with the default size', () => {
    render(<Text>Olá</Text>)
    expect(screen.getByText('Olá')).toHaveClass('text-cc-base')
  })

  it.each([
    ['sm', 'text-cc-sm'],
    ['lg', 'text-cc-lg'],
  ] as const)('applies the %s size', (size, className) => {
    render(<Text size={size}>Olá</Text>)
    expect(screen.getByText('Olá')).toHaveClass(className)
  })
})
