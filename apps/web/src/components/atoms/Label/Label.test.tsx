import { render, screen } from '@testing-library/react'
import { Label } from './Label'

describe('Label', () => {
  it('renders its text and links to the htmlFor target', () => {
    render(
      <>
        <Label htmlFor="x">Senha</Label>
        <input id="x" />
      </>,
    )
    expect(screen.getByText('Senha')).toHaveAttribute('for', 'x')
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
  })
})
