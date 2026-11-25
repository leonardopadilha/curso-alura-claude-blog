import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { Tag } from './Tag'

describe('Tag', () => {
  it('renders a plain label when it is not clickable', () => {
    render(<Tag>react</Tag>)
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('becomes a toggle button with onClick', async () => {
    const onClick = vi.fn()
    render(<Tag onClick={onClick}>react</Tag>)

    const button = screen.getByRole('button', { name: 'react' })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('shows it is selected, with the remove icon', () => {
    const { container } = render(
      <Tag onClick={() => {}} selected>
        react
      </Tag>,
    )
    expect(screen.getByRole('button', { name: 'react' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
