import { render, screen } from '@testing-library/react'
import { AuthTemplate } from './AuthTemplate'

describe('AuthTemplate', () => {
  it('renders the banner, the form and the footer', () => {
    render(
      <AuthTemplate banner={{ src: '/b.jpg', alt: 'Banner de teste' }} footer={<p>rodapé</p>}>
        <form aria-label="formulário" />
      </AuthTemplate>,
    )
    expect(screen.getByAltText('Banner de teste')).toHaveAttribute('src', '/b.jpg')
    expect(screen.getByRole('form', { name: 'formulário' })).toBeInTheDocument()
    expect(screen.getByText('rodapé')).toBeInTheDocument()
  })
})
