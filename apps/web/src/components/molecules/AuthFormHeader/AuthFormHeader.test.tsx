import { render, screen } from '@testing-library/react'
import { AuthFormHeader } from './AuthFormHeader'

describe('AuthFormHeader', () => {
  it('renders the title as a heading and the subtitle', () => {
    render(<AuthFormHeader title="Cadastro" subtitle="Olá! Preencha seus dados." />)
    expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeInTheDocument()
    expect(screen.getByText('Olá! Preencha seus dados.')).toBeInTheDocument()
  })
})
