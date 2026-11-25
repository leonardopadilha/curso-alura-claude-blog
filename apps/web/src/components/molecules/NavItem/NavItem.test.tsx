import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import { NavItem } from './NavItem'

const icon = <svg data-testid="icon" />

function renderItem(props: Partial<Parameters<typeof NavItem>[0]> = {}) {
  return render(
    <MemoryRouter>
      <NavItem icon={icon} label="Feed" {...props} />
    </MemoryRouter>,
  )
}

describe('NavItem', () => {
  it('renders a link with icon and label when it has a destination', () => {
    renderItem({ to: '/' })
    expect(screen.getByRole('link', { name: 'Feed' })).toHaveAttribute('href', '/')
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('marks the current page', () => {
    renderItem({ to: '/', active: true })
    expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page')
  })

  it('renders a button that runs the action', async () => {
    const onClick = vi.fn()
    renderItem({ label: 'Sair', onClick })

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders a disabled item that is not interactive', () => {
    renderItem({ label: 'Perfil', disabled: true })
    expect(screen.getByText('Perfil').closest('span[aria-disabled]')).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
