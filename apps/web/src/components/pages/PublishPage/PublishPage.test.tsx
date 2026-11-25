import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'
import { createPost, uploadImage } from '../../../services/posts'
import { makePost } from '../../../test/fixtures'
import { PublishPage } from './PublishPage'

vi.mock('../../../services/posts', () => ({ createPost: vi.fn(), uploadImage: vi.fn() }))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/publicar']}>
      <Routes>
        <Route path="/" element={<p>Feed</p>} />
        <Route path="/publicar" element={<PublishPage />} />
        <Route path="/posts/:id" element={<p>Detalhes do post</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function fillRequired() {
  await userEvent.type(screen.getByLabelText('Nome do projeto'), 'React zero to hero')
  await userEvent.type(screen.getByLabelText('Descrição'), 'Um projeto de estudo')
}

describe('PublishPage', () => {
  beforeEach(() => {
    vi.mocked(createPost).mockReset().mockResolvedValue(makePost({ id: 'novo' }))
    vi.mocked(uploadImage).mockReset()
  })

  it('renders the new project form', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Novo projeto' })).toBeInTheDocument()
    expect(document.title).toBe('Publicar projeto | Code Connect')
  })

  it('publishes without an image and opens the new post', async () => {
    renderPage()
    await fillRequired()
    await userEvent.type(screen.getByLabelText('Tags'), 'react{Enter}')
    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(await screen.findByText('Detalhes do post')).toBeInTheDocument()
    expect(createPost).toHaveBeenCalledWith({
      title: 'React zero to hero',
      description: 'Um projeto de estudo',
      code: undefined,
      thumbnailUrl: undefined,
      tags: ['react'],
    })
    expect(uploadImage).not.toHaveBeenCalled()
  })

  it('uploads the image first and uses its url as the thumbnail', async () => {
    vi.mocked(uploadImage).mockResolvedValue('/uploads/capa.png')
    renderPage()
    await fillRequired()
    const file = new File(['x'], 'capa.png', { type: 'image/png' })
    await userEvent.upload(screen.getByLabelText('Imagem de capa'), file)
    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(await screen.findByText('Detalhes do post')).toBeInTheDocument()
    expect(uploadImage).toHaveBeenCalledWith(file)
    expect(createPost).toHaveBeenCalledWith(expect.objectContaining({ thumbnailUrl: '/uploads/capa.png' }))
  })

  it('shows the error and stays on the page when publishing fails', async () => {
    vi.mocked(createPost).mockRejectedValue(new Error('boom'))
    renderPage()
    await fillRequired()
    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Novo projeto' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeEnabled()
  })

  it('goes back to the feed when the user discards', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }))
    expect(await screen.findByText('Feed')).toBeInTheDocument()
    expect(createPost).not.toHaveBeenCalled()
  })
})
