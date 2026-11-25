import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { FeedFilters } from './FeedFilters'

function setup(props: Partial<Parameters<typeof FeedFilters>[0]> = {}) {
  const handlers = { onSearchChange: vi.fn(), onToggleTag: vi.fn(), onClear: vi.fn() }
  render(
    <FeedFilters search="" tags={['react', 'css']} selectedTags={[]} {...handlers} {...props} />,
  )
  return handlers
}

describe('FeedFilters', () => {
  it('renders the search box and the suggested tags', () => {
    setup()
    expect(screen.getByRole('searchbox', { name: 'Buscar posts' })).toHaveAttribute(
      'placeholder',
      'Digite o que você procura',
    )
    expect(screen.getByRole('button', { name: 'react' })).toBeInTheDocument()
  })

  it('reports the typed text', async () => {
    const { onSearchChange } = setup()
    await userEvent.type(screen.getByRole('searchbox'), 'a')
    expect(onSearchChange).toHaveBeenCalledWith('a')
  })

  it('reports the toggled tag', async () => {
    const { onToggleTag } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'css' }))
    expect(onToggleTag).toHaveBeenCalledWith('css')
  })

  it('offers "Limpar tudo" only with an active filter', async () => {
    const { rerender } = render(
      <FeedFilters
        search=""
        onSearchChange={() => {}}
        tags={[]}
        selectedTags={[]}
        onToggleTag={() => {}}
        onClear={() => {}}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Limpar tudo' })).not.toBeInTheDocument()

    const onClear = vi.fn()
    rerender(
      <FeedFilters
        search="react"
        onSearchChange={() => {}}
        tags={[]}
        selectedTags={[]}
        onToggleTag={() => {}}
        onClear={onClear}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Limpar tudo' }))
    expect(onClear).toHaveBeenCalledOnce()
  })
})
