import { useState, type SubmitEvent } from 'react'
import { useLocation } from 'react-router'
import { getApiErrorMessage } from '../../../services/api'
import type { Comment } from '../../../services/posts'
import { Button } from '../../atoms/Button/Button'
import { TextArea } from '../../atoms/TextArea/TextArea'
import { TextLink } from '../../atoms/TextLink/TextLink'
import { CommentItem } from '../../molecules/CommentItem/CommentItem'

type CommentSectionProps = {
  comments: Comment[]
  isLoggedIn: boolean
  /** Publica o comentário (ou a resposta, com `parentId`). Deve rejeitar em caso de erro. */
  onSubmit: (content: string, parentId?: string) => Promise<void>
}

type CommentFormProps = {
  label: string
  submitLabel: string
  onSubmit: (content: string) => Promise<void>
  onCancel?: () => void
  autoFocus?: boolean
}

function CommentForm({ label, submitLabel, onSubmit, onCancel, autoFocus }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string>()
  const [sending, setSending] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!content.trim()) return
    setError(undefined)
    setSending(true)
    try {
      await onSubmit(content.trim())
      setContent('')
    } catch (e) {
      setError(getApiErrorMessage(e))
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label className="sr-only" htmlFor={label}>
        {label}
      </label>
      <TextArea
        id={label}
        rows={3}
        maxLength={1000}
        required
        autoFocus={autoFocus}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        className="bg-offwhite"
      />
      {error && (
        <p role="alert" className="text-base text-cinza-escuro">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={sending} className="w-auto px-6 py-2">
          {sending ? 'Enviando…' : submitLabel}
        </Button>
        {onCancel && (
          <Button variant="neutral" onClick={onCancel} className="w-auto border-cinza-escuro px-6 py-2 text-cinza-escuro">
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}

export function CommentSection({ comments, isLoggedIn, onSubmit }: CommentSectionProps) {
  const location = useLocation()
  const [replyingTo, setReplyingTo] = useState<string>()
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set())

  const roots = comments.filter((comment) => comment.parentId === null)
  const repliesOf = (id: string) => comments.filter((comment) => comment.parentId === id)

  function toggleReplies(id: string) {
    setExpanded((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)
      return next
    })
  }

  async function handleReply(rootId: string, content: string) {
    await onSubmit(content, rootId)
    setReplyingTo(undefined)
    setExpanded((current) => new Set(current).add(rootId))
  }

  return (
    <section id="comentarios" aria-labelledby="comentarios-titulo" className="flex flex-col gap-6 bg-cinza-medio px-4 py-8">
      <h2 id="comentarios-titulo" className="text-xl font-semibold text-cinza-escuro">
        Comentários
      </h2>

      {isLoggedIn ? (
        <CommentForm
          label="Escreva um comentário"
          submitLabel="Comentar"
          onSubmit={(content) => onSubmit(content)}
        />
      ) : (
        <p className="text-base text-cinza-escuro">
          <TextLink to="/login" state={{ from: `${location.pathname}${location.search}` }} className="font-semibold">
            Entre
          </TextLink>{' '}
          para comentar ou responder.
        </p>
      )}

      {roots.length === 0 ? (
        <p className="text-base text-cinza-escuro">Ainda não há comentários. Seja a primeira pessoa!</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {roots.map((root) => {
            const replies = repliesOf(root.id)
            const open = expanded.has(root.id)
            return (
              <li key={root.id} className="flex flex-col gap-2 border-t border-cinza-escuro/40 pt-4 first:border-t-0 first:pt-0">
                <CommentItem
                  comment={root}
                  onReply={isLoggedIn ? () => setReplyingTo(root.id) : undefined}
                />

                {replies.length > 0 && (
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => toggleReplies(root.id)}
                    className="flex w-fit cursor-pointer items-center gap-2 text-xs text-cinza-escuro"
                  >
                    <span aria-hidden="true" className="h-px w-8 bg-cinza-escuro" />
                    {open ? 'Ocultar respostas' : `Ver respostas (${replies.length})`}
                  </button>
                )}

                {open && (
                  <ul className="flex flex-col gap-2 pl-10">
                    {replies.map((reply) => (
                      <li key={reply.id}>
                        <CommentItem
                          comment={reply}
                          onReply={isLoggedIn ? () => setReplyingTo(root.id) : undefined}
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {replyingTo === root.id && (
                  <div className="pl-10">
                    <CommentForm
                      autoFocus
                      label={`Responder a ${root.author.name}`}
                      submitLabel="Responder"
                      onSubmit={(content) => handleReply(root.id, content)}
                      onCancel={() => setReplyingTo(undefined)}
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
