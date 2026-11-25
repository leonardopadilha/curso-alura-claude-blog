import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { TagFilters } from './TagFilters'

function setup(props: Partial<Parameters<typeof TagFilters>[0]> = {}) {
  const onToggle = vi.fn()
  const onClear = vi.fn()
  render(
    <TagFilters
      tags={['react', 'css']}
      selected={[]}
      onToggle={onToggle}
      onClear={onClear}
      canClear={false}
      {...props}
    />,
  )
  return { onToggle, onClear }
}

describe('TagFilters', () => {
  it('lists the suggested tags as toggles', () => {
    setup()
    expect(screen.getByRole('button', { name: 'react' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'css' })).toBeInTheDocument()
  })

  it('shows the selected tags first, even when they are not suggested', () => {
    setup({ selected: ['acessibilidade', 'css'] })

    const names = screen.getAllByRole('button').map((button) => button.textContent)
    expect(names).toEqual(['acessibilidade', 'css', 'react'])
    expect(screen.getByRole('button', { name: 'css' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('toggles a tag when clicked', async () => {
    const { onToggle } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'react' }))
    expect(onToggle).toHaveBeenCalledWith('react')
  })

  it('hides "Limpar tudo" when there is nothing to clear', () => {
    setup({ canClear: false })
    expect(screen.queryByRole('button', { name: 'Limpar tudo' })).not.toBeInTheDocument()
  })

  it('clears the filters with "Limpar tudo"', async () => {
    const { onClear } = setup({ canClear: true })
    await userEvent.click(screen.getByRole('button', { name: 'Limpar tudo' }))
    expect(onClear).toHaveBeenCalledOnce()
  })
})
