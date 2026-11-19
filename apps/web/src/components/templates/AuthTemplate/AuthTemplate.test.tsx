import { render, screen } from '@testing-library/react'
import { AuthTemplate } from './AuthTemplate'

describe('AuthTemplate', () => {
  it('renders the banner, the form and the footer', () => {
    render(
      <AuthTemplate
        banner={{ src: '/b.jpg', alt: 'Banner de teste', width: 407, height: 628 }}
        footer={<p>rodapé</p>}
      >
        <form aria-label="formulário" />
      </AuthTemplate>,
    )
    const banner = screen.getByAltText('Banner de teste')
    expect(banner).toHaveAttribute('src', '/b.jpg')
    expect(banner).toHaveAttribute('width', '407')
    expect(banner).toHaveAttribute('height', '628')
    expect(banner).toHaveAttribute('loading', 'lazy')
    expect(screen.getByRole('form', { name: 'formulário' })).toBeInTheDocument()
    expect(screen.getByText('rodapé')).toBeInTheDocument()
  })
})
