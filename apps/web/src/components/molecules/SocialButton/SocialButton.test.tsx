import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { SocialButton } from './SocialButton'

describe('SocialButton', () => {
  it('renders the label and icon', () => {
    render(<SocialButton icon={<svg data-testid="i" />} label="Github" />)
    expect(screen.getByRole('button', { name: 'Github' })).toBeInTheDocument()
    expect(screen.getByTestId('i')).toBeInTheDocument()
  })

  it('calls onClick', async () => {
    const onClick = vi.fn()
    render(<SocialButton icon={null} label="Gmail" onClick={onClick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Gmail' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
