import { Link } from 'react-router'
import type { PostSummary } from '../../../services/posts'
import { ChatIcon, CodeIcon, ShareIcon } from '../../atoms/icons/icons'
import { Tag } from '../../atoms/Tag/Tag'
import { AuthorBadge } from '../../molecules/AuthorBadge/AuthorBadge'
import { PostCover } from '../../molecules/PostCover/PostCover'
import { StatButton } from '../../molecules/StatButton/StatButton'

type PostCardProps = {
  post: PostSummary
  /** `card`: item do feed. `detail`: topo da página do post (capa e título maiores). */
  variant?: 'card' | 'detail'
  /** Curtir/descurtir. A página decide o que fazer com visitantes (mandar para o login). */
  onLike: (post: PostSummary) => void
  onShare?: (post: PostSummary) => void
}

export function PostCard({ post, variant = 'card', onLike, onShare }: PostCardProps) {
  const isDetail = variant === 'detail'
  const Title = isDetail ? 'h1' : 'h2'

  return (
    <article className="flex flex-col">
      <PostCover src={post.thumbnailUrl} alt={`Capa do post ${post.title}`} size={variant} />

      <div className="flex flex-1 flex-col gap-4 rounded-b-lg bg-cinza-escuro p-4">
        <div className="flex flex-col gap-2 text-cinza-claro">
          <Title className={`font-semibold ${isDetail ? 'text-xl' : 'text-lg'}`}>
            {isDetail ? (
              post.title
            ) : (
              <Link to={`/posts/${post.id}`} className="hover:underline">
                {post.title}
              </Link>
            )}
          </Title>
          <p className={`text-base ${isDetail ? '' : 'line-clamp-3'}`}>{post.description}</p>
        </div>

        {post.tags.length > 0 && (
          <ul aria-label="Tags" className="flex flex-wrap gap-2.5">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Tag>{tag}</Tag>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <StatButton
              icon={<CodeIcon className="size-6" />}
              label={post.likedByMe ? 'Remover curtida' : 'Curtir'}
              count={post.likesCount}
              active={post.likedByMe}
              onClick={() => onLike(post)}
            />
            {onShare && (
              <StatButton
                icon={<ShareIcon className="size-6" />}
                label="Compartilhar"
                onClick={() => onShare(post)}
              />
            )}
            <StatButton
              icon={<ChatIcon className="size-6" />}
              label="Comentários"
              count={post.commentsCount}
              to={`/posts/${post.id}#comentarios`}
            />
          </div>
          <AuthorBadge name={post.author.name} />
        </div>
      </div>
    </article>
  )
}
