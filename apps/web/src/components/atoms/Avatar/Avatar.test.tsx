import { render, screen } from '@testing-library/react'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it("shows the person's initial in uppercase", () => {
    render(<Avatar name="  júlio andrade" />)
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('is decorative for assistive technology', () => {
    render(<Avatar name="Ana" />)
    expect(screen.getByText('A')).toHaveAttribute('aria-hidden', 'true')
  })
})
