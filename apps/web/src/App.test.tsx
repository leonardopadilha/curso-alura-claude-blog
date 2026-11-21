import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from './App'

describe('App', () => {
  it('redirects unknown routes to the login page', async () => {
    render(
      <MemoryRouter initialEntries={['/qualquer-coisa']}>
        <App />
      </MemoryRouter>,
    )
    // Primeira rota lazy do arquivo: o import frio (agora com axios) passa de 1s.
    expect(
      await screen.findByRole('heading', { name: 'Login' }, { timeout: 5000 }),
    ).toBeInTheDocument()
  })

  it('renders the signup page on /cadastro', async () => {
    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <App />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: 'Cadastro' })).toBeInTheDocument()
  })
})
