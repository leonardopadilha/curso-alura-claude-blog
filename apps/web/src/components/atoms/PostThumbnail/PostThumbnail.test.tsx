import { fireEvent, render, screen } from '@testing-library/react'
import { PostThumbnail } from './PostThumbnail'

describe('PostThumbnail', () => {
  it('renders the image when there is a src', () => {
    render(<PostThumbnail src="/uploads/a.png" alt="Capa do post" />)
    expect(screen.getByRole('img', { name: 'Capa do post' })).toHaveAttribute('src', '/uploads/a.png')
  })

  it.each([null, undefined, ''])('shows the placeholder when src is %j', (src) => {
    render(<PostThumbnail src={src} alt="Capa" />)
    expect(screen.getByRole('img', { name: 'Post sem imagem' })).toBeInTheDocument()
  })

  it('falls back to the placeholder when the image fails to load', () => {
    render(<PostThumbnail src="/uploads/quebrada.png" alt="Capa" />)

    fireEvent.error(screen.getByRole('img', { name: 'Capa' }))

    expect(screen.getByRole('img', { name: 'Post sem imagem' })).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Capa' })).not.toBeInTheDocument()
  })

  it('tries again when the src changes after a failure', () => {
    const { rerender } = render(<PostThumbnail src="/uploads/quebrada.png" alt="Capa" />)
    fireEvent.error(screen.getByRole('img', { name: 'Capa' }))

    rerender(<PostThumbnail src="/uploads/nova.png" alt="Capa" />)

    expect(screen.getByRole('img', { name: 'Capa' })).toHaveAttribute('src', '/uploads/nova.png')
  })
})
