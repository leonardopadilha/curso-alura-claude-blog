import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useAuthGuard } from '../../../hooks/useAuthGuard'
import { usePostShare } from '../../../hooks/usePostShare'
import { useSession } from '../../../hooks/useSession'
import { getApiErrorMessage } from '../../../services/api'
import {
  createComment,
  getPost,
  likePost,
  listComments,
  unlikePost,
  type Comment,
  type PostDetail,
} from '../../../services/posts'
import { PageMeta } from '../../atoms/PageMeta/PageMeta'
import { TextLink } from '../../atoms/TextLink/TextLink'
import { CodeBlock } from '../../molecules/CodeBlock/CodeBlock'
import { CommentSection } from '../../organisms/CommentSection/CommentSection'
import { PostCard } from '../../organisms/PostCard/PostCard'

/** Resultado do carregamento de um post. `key` diz de qual post/sessão ele é. */
type Loaded =
  | { key: string; status: 'error'; message: string }
  | { key: string; status: 'ready'; post: PostDetail; comments: Comment[] }

/** Detalhes de um post: público para leitura; curtir e comentar exigem login. */
export function PostPage() {
  const { id = '' } = useParams()
  const { isLoggedIn } = useSession()
  const { redirectToLogin, handleUnauthorized } = useAuthGuard()
  const { message: shareMessage, share } = usePostShare()
  const [loaded, setLoaded] = useState<Loaded>()
  const [actionError, setActionError] = useState<string>()

  // Ao entrar ou sair, recarrega para atualizar "curtido por mim".
  const key = `${id}|${isLoggedIn}`
  const state = loaded?.key === key ? loaded : undefined

  useEffect(() => {
    let active = true
    Promise.all([getPost(id), listComments(id)])
      .then(([post, comments]) => {
        if (active) setLoaded({ key, status: 'ready', post, comments })
      })
      .catch((e) => {
        if (active) setLoaded({ key, status: 'error', message: getApiErrorMessage(e) })
      })
    return () => {
      active = false
    }
  }, [id, key])

  async function handleLike() {
    if (state?.status !== 'ready') return
    if (!isLoggedIn) {
      redirectToLogin()
      return
    }
    setActionError(undefined)
    try {
      const { post } = state
      const like = post.likedByMe ? await unlikePost(post.id) : await likePost(post.id)
      setLoaded((current) =>
        current?.status === 'ready' ? { ...current, post: { ...current.post, ...like } } : current,
      )
    } catch (e) {
      if (!handleUnauthorized(e)) setActionError(getApiErrorMessage(e))
    }
  }

  async function handleComment(content: string, parentId?: string) {
    try {
      const comment = await createComment(id, { content, parentId })
      setLoaded((current) =>
        current?.status === 'ready'
          ? {
              ...current,
              comments: [...current.comments, comment],
              post: { ...current.post, commentsCount: current.post.commentsCount + 1 },
            }
          : current,
      )
    } catch (e) {
      // Sessão expirada: vai para o login em vez de mostrar erro no formulário.
      if (!handleUnauthorized(e)) throw e
    }
  }

  if (!state) {
    return (
      <>
        <PageMeta title="Post | Code Connect" description="Detalhes de um projeto do Code Connect." />
        <p role="status" aria-busy="true" className="py-10 text-center text-xl text-cinza-medio">
          Carregando post…
        </p>
      </>
    )
  }

  if (state.status === 'error') {
    return (
      <>
        <PageMeta title="Post não encontrado | Code Connect" description="Detalhes de um projeto do Code Connect." />
        <div className="flex flex-col items-center gap-4 py-10">
          <p role="alert" className="text-xl text-cinza-medio">
            {state.message}
          </p>
          <TextLink to="/" variant="accent">
            Voltar ao feed
          </TextLink>
        </div>
      </>
    )
  }

  const { post, comments } = state

  return (
    <>
      <PageMeta
        title={`${post.title} | Code Connect`}
        description={post.description.slice(0, 150)}
      />
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <PostCard post={post} variant="detail" onLike={handleLike} onShare={share} />
          {shareMessage && (
            <p role="status" className="text-base text-verde-destaque">
              {shareMessage}
            </p>
          )}
          {actionError && (
            <p role="alert" className="text-base text-erro">
              {actionError}
            </p>
          )}
          {post.code && <CodeBlock code={post.code} />}
        </div>
        <CommentSection comments={comments} isLoggedIn={isLoggedIn} onSubmit={handleComment} />
      </div>
    </>
  )
}
