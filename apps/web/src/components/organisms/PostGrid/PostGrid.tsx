import type { PostSummary } from '../../../services/posts'
import { PostCard } from '../PostCard/PostCard'

type PostGridProps = {
  posts: PostSummary[]
  onLike: (post: PostSummary) => void
  onShare?: (post: PostSummary) => void
}

export function PostGrid({ posts, onLike, onShare }: PostGridProps) {
  if (posts.length === 0) {
    return <p className="py-10 text-center text-xl text-cinza-medio">Nenhum post encontrado.</p>
  }

  return (
    <ul className="grid gap-6 md:grid-cols-2">
      {posts.map((post) => (
        <li key={post.id} className="flex flex-col">
          <PostCard post={post} onLike={onLike} onShare={onShare} />
        </li>
      ))}
    </ul>
  )
}
