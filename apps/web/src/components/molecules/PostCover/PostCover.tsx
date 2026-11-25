import { PostThumbnail } from '../../atoms/PostThumbnail/PostThumbnail'

type PostCoverProps = {
  src?: string | null
  alt: string
  /** `card`: miniatura do feed. `detail`: capa maior da página do post. */
  size?: 'card' | 'detail'
  /** Cantos de baixo retos, quando o corpo do card vem logo abaixo. */
  attached?: boolean
}

/** Moldura cinza com a imagem do post (ou o placeholder quando não há imagem). */
export function PostCover({ src, alt, size = 'card', attached = true }: PostCoverProps) {
  const height = size === 'card' ? 'h-48' : 'h-80'
  const padding = size === 'card' ? 'p-6' : 'px-4 py-6'

  return (
    <div className={`bg-cinza-medio ${padding} ${attached ? 'rounded-t-lg' : 'rounded-lg'}`}>
      <div className={height}>
        <PostThumbnail src={src} alt={alt} />
      </div>
    </div>
  )
}
