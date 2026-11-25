import { render, screen } from '@testing-library/react'
import { AuthorBadge } from './AuthorBadge'

describe('AuthorBadge', () => {
  it('shows the @handle and the initial of the author', () => {
    render(<AuthorBadge name="Júlio Andrade" />)
    expect(screen.getByText('@julio')).toBeInTheDocument()
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('has a dark tone for light backgrounds', () => {
    const { rerender } = render(<AuthorBadge name="Ana" />)
    expect(screen.getByText('@ana')).toHaveClass('text-cinza-medio')

    rerender(<AuthorBadge name="Ana" tone="dark" />)
    expect(screen.getByText('@ana')).toHaveClass('text-cinza-escuro')
  })
})
