import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import { StatButton } from './StatButton'

const icon = <svg data-testid="icon" />

describe('StatButton', () => {
  it('shows the icon and the count, and names the action', () => {
    render(<StatButton icon={icon} label="Curtir" count={12} onClick={() => {}} />)
    expect(screen.getByRole('button', { name: 'Curtir (12)' })).toHaveTextContent('12')
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('runs the action when clicked', async () => {
    const onClick = vi.fn()
    render(<StatButton icon={icon} label="Curtir" count={0} onClick={onClick} />)

    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('exposes the on/off state', () => {
    const { rerender } = render(<StatButton icon={icon} label="Curtir" active={false} onClick={() => {}} />)
    expect(screen.getByRole('button', { name: 'Curtir' })).toHaveAttribute('aria-pressed', 'false')

    rerender(<StatButton icon={icon} label="Curtir" active onClick={() => {}} />)
    expect(screen.getByRole('button', { name: 'Curtir' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders a link when it has a destination', () => {
    render(
      <MemoryRouter>
        <StatButton icon={icon} label="Comentários" count={3} to="/posts/1#comentarios" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Comentários (3)' })).toHaveAttribute(
      'href',
      '/posts/1#comentarios',
    )
  })
})
