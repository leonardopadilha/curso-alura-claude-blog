import type { Comment } from '../../../services/posts'
import { AuthorBadge } from '../AuthorBadge/AuthorBadge'

type CommentItemProps = {
  comment: Comment
  /** Mostra o botão "Responder" (só para quem está logado). */
  onReply?: () => void
}

export function CommentItem({ comment, onReply }: CommentItemProps) {
  return (
    <article className="flex flex-col gap-2 text-cinza-escuro">
      <div className="flex flex-wrap items-center gap-x-2">
        <AuthorBadge name={comment.author.name} tone="dark" />
        <p className="text-base">{comment.content}</p>
      </div>
      {onReply && (
        <button
          type="button"
          onClick={onReply}
          className="w-fit cursor-pointer text-base font-semibold hover:underline"
        >
          Responder
        </button>
      )}
    </article>
  )
}
