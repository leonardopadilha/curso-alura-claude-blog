import { render, screen } from '@testing-library/react'
import { AppTemplate } from './AppTemplate'

describe('AppTemplate', () => {
  it('renders the menu and the page content', () => {
    render(
      <AppTemplate menu={<nav aria-label="Menu de teste">Menu</nav>}>
        <h1>Conteúdo da página</h1>
      </AppTemplate>,
    )

    expect(screen.getByRole('navigation', { name: 'Menu de teste' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Conteúdo da página' })).toBeInTheDocument()
  })

  it('puts the page content inside the main landmark, and the menu outside it', () => {
    render(
      <AppTemplate menu={<nav aria-label="Menu de teste">Menu</nav>}>
        <p>Conteúdo</p>
      </AppTemplate>,
    )

    const main = screen.getByRole('main')
    expect(main).toContainElement(screen.getByText('Conteúdo'))
    expect(main).not.toContainElement(screen.getByRole('navigation'))
  })
})
