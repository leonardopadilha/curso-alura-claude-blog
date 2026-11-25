import { useState } from 'react'
import { CodeIcon } from '../icons/icons'

type PostThumbnailProps = {
  /** Sem imagem (ou com a imagem quebrada), mostra um placeholder. */
  src?: string | null
  alt: string
  className?: string
}

const frame = 'size-full rounded-lg shadow-[0_16px_24px_rgba(0,0,0,0.24)]'

export function PostThumbnail({ src, alt, className = '' }: PostThumbnailProps) {
  // Guarda qual endereço falhou: se o `src` mudar, a nova imagem tem outra chance.
  const [failedSrc, setFailedSrc] = useState<string>()

  if (!src || failedSrc === src) {
    return (
      <div
        role="img"
        aria-label="Post sem imagem"
        className={`${frame} flex items-center justify-center bg-cinza-escuro text-cinza-medio ${className}`}
      >
        <CodeIcon className="size-16" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(src)}
      className={`${frame} object-cover object-top ${className}`}
    />
  )
}
