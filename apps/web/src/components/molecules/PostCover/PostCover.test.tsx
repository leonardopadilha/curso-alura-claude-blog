import { render, screen } from '@testing-library/react'
import { PostCover } from './PostCover'

describe('PostCover', () => {
  it('shows the post image', () => {
    render(<PostCover src="/uploads/a.png" alt="Capa de React" />)
    expect(screen.getByRole('img', { name: 'Capa de React' })).toBeInTheDocument()
  })

  it('shows the placeholder when the post has no image', () => {
    render(<PostCover src={null} alt="Capa de React" />)
    expect(screen.getByRole('img', { name: 'Post sem imagem' })).toBeInTheDocument()
  })

  it('is taller in the detail size', () => {
    const { container, rerender } = render(<PostCover src={null} alt="x" />)
    expect(container.querySelector('.h-48')).toBeInTheDocument()

    rerender(<PostCover src={null} alt="x" size="detail" />)
    expect(container.querySelector('.h-80')).toBeInTheDocument()
  })
})
