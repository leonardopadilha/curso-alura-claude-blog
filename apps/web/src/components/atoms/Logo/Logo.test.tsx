import { render, screen } from '@testing-library/react'
import { Logo } from './Logo'

describe('Logo', () => {
  it('renders the Code Connect logo with its dimensions', () => {
    render(<Logo />)
    const logo = screen.getByRole('img', { name: 'Code Connect' })
    expect(logo).toHaveAttribute('width', '127')
    expect(logo).toHaveAttribute('height', '40')
  })

  it('accepts extra classes', () => {
    render(<Logo className="mx-auto" />)
    expect(screen.getByRole('img')).toHaveClass('mx-auto')
  })
})
