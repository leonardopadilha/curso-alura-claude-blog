import { render, screen } from '@testing-library/react'
import { CodeBlock } from './CodeBlock'

describe('CodeBlock', () => {
  it('renders the label and keeps the code formatting', () => {
    const code = 'const a = 1\n  return a'
    render(<CodeBlock code={code} />)

    expect(screen.getByRole('heading', { name: 'Código:' })).toBeInTheDocument()
    expect(screen.getByText((_, element) => element?.tagName === 'CODE' && element.textContent === code)).toBeInTheDocument()
  })

  it('can be scrolled with the keyboard', () => {
    render(<CodeBlock code="x" />)
    expect(screen.getByText('x').closest('pre')).toHaveAttribute('tabindex', '0')
  })
})
