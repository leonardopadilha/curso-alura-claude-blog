import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from './App'

describe('App', () => {
  it('redirects unknown routes to the login page', () => {
    render(
      <MemoryRouter initialEntries={['/qualquer-coisa']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
  })
})
