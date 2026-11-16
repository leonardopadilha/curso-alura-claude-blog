import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { SocialLogin } from './SocialLogin'

describe('SocialLogin', () => {
  it('renders the divider and both providers', () => {
    render(<SocialLogin />)
    expect(screen.getByRole('separator')).toHaveTextContent(
      'ou entre com outras contas',
    )
    expect(screen.getByRole('button', { name: 'Github' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gmail' })).toBeInTheDocument()
  })

  it('calls the matching callback for each provider', async () => {
    const onGithub = vi.fn()
    const onGoogle = vi.fn()
    render(<SocialLogin onGithub={onGithub} onGoogle={onGoogle} />)
    await userEvent.click(screen.getByRole('button', { name: 'Github' }))
    expect(onGithub).toHaveBeenCalledOnce()
    expect(onGoogle).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Gmail' }))
    expect(onGoogle).toHaveBeenCalledOnce()
  })
})
