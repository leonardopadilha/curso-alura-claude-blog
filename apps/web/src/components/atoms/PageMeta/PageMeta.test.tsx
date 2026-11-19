import { render } from '@testing-library/react'
import { PageMeta } from './PageMeta'

const getDescriptions = () =>
  document.head.querySelectorAll<HTMLMetaElement>('meta[name="description"]')

describe('PageMeta', () => {
  afterEach(() => {
    getDescriptions().forEach((meta) => meta.remove())
  })

  it('sets the document title and creates the meta description when missing', () => {
    render(<PageMeta title="Login | Code Connect" description="Entre na sua conta." />)
    expect(document.title).toBe('Login | Code Connect')
    expect(getDescriptions()).toHaveLength(1)
    expect(getDescriptions()[0]).toHaveAttribute('content', 'Entre na sua conta.')
  })

  it('reuses the existing meta description instead of duplicating it', () => {
    const existing = document.createElement('meta')
    existing.name = 'description'
    existing.content = 'fallback'
    document.head.appendChild(existing)

    render(<PageMeta title="Cadastro | Code Connect" description="Crie sua conta." />)
    expect(getDescriptions()).toHaveLength(1)
    expect(existing).toHaveAttribute('content', 'Crie sua conta.')
  })
})
