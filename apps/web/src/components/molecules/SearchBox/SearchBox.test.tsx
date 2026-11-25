import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { SearchBox } from './SearchBox'

describe('SearchBox', () => {
  it('renders a named search field with a placeholder', () => {
    render(<SearchBox label="Buscar posts" placeholder="Digite o que você procura" />)
    expect(screen.getByRole('search')).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Buscar posts' })).toHaveAttribute(
      'placeholder',
      'Digite o que você procura',
    )
  })

  it('reports what is typed', async () => {
    const onChange = vi.fn()
    render(<SearchBox label="Buscar posts" value="" onChange={onChange} />)

    await userEvent.type(screen.getByRole('searchbox'), 'r')
    expect(onChange).toHaveBeenCalledOnce()
  })
})
