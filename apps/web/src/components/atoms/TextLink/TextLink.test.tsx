import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { TextLink } from './TextLink'

describe('TextLink', () => {
  it('renders a link pointing to the target', () => {
    render(
      <MemoryRouter>
        <TextLink to="/cadastro">Cadastro</TextLink>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Cadastro' })).toHaveAttribute(
      'href',
      '/cadastro',
    )
  })

  it('applies the accent variant', () => {
    render(
      <MemoryRouter>
        <TextLink to="/x" variant="accent">
          Ir
        </TextLink>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link')).toHaveClass('text-cc-accent')
  })
})
