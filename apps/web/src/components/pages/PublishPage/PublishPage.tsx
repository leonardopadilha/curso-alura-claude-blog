import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuthGuard } from '../../../hooks/useAuthGuard'
import { getApiErrorMessage } from '../../../services/api'
import { createPost, uploadImage } from '../../../services/posts'
import { PageMeta } from '../../atoms/PageMeta/PageMeta'
import { PostForm, type PostFormValues } from '../../organisms/PostForm/PostForm'

/** Publicação de um novo post (só para usuários logados; a rota é protegida). */
export function PublishPage() {
  const navigate = useNavigate()
  const { handleUnauthorized } = useAuthGuard()
  const [error, setError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit({ title, description, code, tags, image }: PostFormValues) {
    setError(undefined)
    setSubmitting(true)
    try {
      const thumbnailUrl = image ? await uploadImage(image) : undefined
      const post = await createPost({
        title,
        description,
        code: code.trim() ? code : undefined,
        thumbnailUrl,
        tags,
      })
      await navigate(`/posts/${post.id}`)
    } catch (e) {
      if (!handleUnauthorized(e)) setError(getApiErrorMessage(e))
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageMeta
        title="Publicar projeto | Code Connect"
        description="Publique um projeto no Code Connect com imagem, descrição e tags."
      />
      <PostForm
        onSubmit={handleSubmit}
        onDiscard={() => void navigate('/')}
        error={error}
        submitting={submitting}
      />
    </>
  )
}
