import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders children and icon', () => {
    render(<Button icon={<span data-testid="icon" />}>Login</Button>)
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('defaults to type button and accepts type submit', () => {
    const { rerender } = render(<Button>Ok</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    rerender(<Button type="submit">Ok</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('is solid by default and supports the outline and neutral variants', () => {
    const { rerender } = render(<Button>Ok</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-verde-destaque')
    rerender(<Button variant="outline">Ok</Button>)
    expect(screen.getByRole('button')).toHaveClass('border-verde-destaque')
    expect(screen.getByRole('button')).not.toHaveClass('bg-verde-destaque')
    rerender(<Button variant="neutral">Ok</Button>)
    expect(screen.getByRole('button')).toHaveClass('border-cinza-medio')
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Ok</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Ok
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
