import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { Tabs } from './Tabs'

const items = [
  { value: 'recent', label: 'Recentes' },
  { value: 'popular', label: 'Populares' },
] as const

describe('Tabs', () => {
  it('renders the tabs and marks the current one', () => {
    render(<Tabs label="Ordenar posts" items={[...items]} value="recent" onChange={() => {}} />)

    expect(screen.getByRole('tablist', { name: 'Ordenar posts' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Recentes' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Populares' })).toHaveAttribute('aria-selected', 'false')
  })

  it('reports the chosen tab', async () => {
    const onChange = vi.fn()
    render(<Tabs label="Ordenar posts" items={[...items]} value="recent" onChange={onChange} />)

    await userEvent.click(screen.getByRole('tab', { name: 'Populares' }))
    expect(onChange).toHaveBeenCalledWith('popular')
  })
})
