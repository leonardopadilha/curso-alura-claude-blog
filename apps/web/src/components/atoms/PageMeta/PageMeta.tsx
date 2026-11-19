import { useEffect } from 'react'

type PageMetaProps = {
  title: string
  description: string
}

/**
 * Atualiza o título e a meta description da página.
 * Reaproveita as tags do `index.html` (que servem de fallback) em vez de criar duplicatas.
 */
export function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    document.title = title

    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = description
  }, [title, description])

  return null
}
