import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { PostForm } from './PostForm'

function setup(props: Partial<Parameters<typeof PostForm>[0]> = {}) {
  const onSubmit = vi.fn()
  const onDiscard = vi.fn()
  render(<PostForm onSubmit={onSubmit} onDiscard={onDiscard} {...props} />)
  return { onSubmit, onDiscard }
}

const png = () => new File(['x'], 'capa.png', { type: 'image/png' })

async function fillRequired() {
  await userEvent.type(screen.getByLabelText('Nome do projeto'), '  React zero to hero ')
  await userEvent.type(screen.getByLabelText('Descrição'), 'Um projeto de estudo')
}

describe('PostForm', () => {
  it('renders the fields, the upload button and the actions', () => {
    setup()

    expect(screen.getByRole('heading', { name: 'Novo projeto' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nome do projeto')).toBeRequired()
    expect(screen.getByLabelText('Descrição')).toBeRequired()
    expect(screen.getByLabelText('Código (opcional)')).not.toBeRequired()
    expect(screen.getByLabelText('Tags')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Carregar imagem' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Descartar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Post sem imagem' })).toBeInTheDocument()
  })

  it('submits the typed values with normalized tags', async () => {
    const { onSubmit } = setup()
    await fillRequired()
    await userEvent.type(screen.getByLabelText('Código (opcional)'), 'const a = 1')
    await userEvent.type(screen.getByLabelText('Tags'), 'React{Enter}Front-end,')
    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'React zero to hero',
      description: 'Um projeto de estudo',
      code: 'const a = 1',
      tags: ['react', 'front-end'],
      image: null,
    })
  })

  it('does not submit without the required fields', async () => {
    const { onSubmit } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('includes a tag that was typed but not confirmed', async () => {
    const { onSubmit } = setup()
    await fillRequired()
    await userEvent.type(screen.getByLabelText('Tags'), 'css')
    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ tags: ['css'] }))
  })

  it('ignores duplicate tags and removes a tag when it is clicked', async () => {
    setup()
    await userEvent.type(screen.getByLabelText('Tags'), 'react{Enter}React{Enter}css{Enter}')

    const list = screen.getByRole('list', { name: 'Tags do projeto' })
    expect(list.querySelectorAll('li')).toHaveLength(2)

    await userEvent.click(screen.getByRole('button', { name: 'react' }))
    expect(list.querySelectorAll('li')).toHaveLength(1)
  })

  it('previews the chosen image, sends it and lets the user remove it', async () => {
    const { onSubmit } = setup()
    await fillRequired()
    const file = png()

    await userEvent.upload(screen.getByLabelText('Imagem de capa'), file)
    expect(screen.getByRole('img', { name: 'Pré-visualização da capa' })).toBeInTheDocument()
    expect(screen.getByText('capa.png')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ image: file }))

    await userEvent.click(screen.getByRole('button', { name: 'Remover imagem' }))
    expect(screen.queryByText('capa.png')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Post sem imagem' })).toBeInTheDocument()
  })

  it('rejects files that are not PNG, JPEG or WebP', async () => {
    setup()
    const gif = new File(['x'], 'animada.gif', { type: 'image/gif' })

    await userEvent.upload(screen.getByLabelText('Imagem de capa'), gif, { applyAccept: false })

    expect(screen.getByRole('alert')).toHaveTextContent('Use uma imagem PNG, JPEG ou WebP.')
    expect(screen.queryByText('animada.gif')).not.toBeInTheDocument()
  })

  it('rejects images above 2 MB', async () => {
    setup()
    const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'grande.png', { type: 'image/png' })

    await userEvent.upload(screen.getByLabelText('Imagem de capa'), big)

    expect(screen.getByRole('alert')).toHaveTextContent('A imagem deve ter até 2 MB.')
  })

  it('discards', async () => {
    const { onDiscard } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }))
    expect(onDiscard).toHaveBeenCalledOnce()
  })

  it('shows the error and disables the button while submitting', () => {
    setup({ error: 'Verifique os dados informados.', submitting: true })
    expect(screen.getByRole('alert')).toHaveTextContent('Verifique os dados informados.')
    expect(screen.getByRole('button', { name: 'Publicando…' })).toBeDisabled()
  })
})
