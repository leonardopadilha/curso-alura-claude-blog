import { useEffect, useRef, useState, type KeyboardEvent, type SubmitEvent } from 'react'
import { Button } from '../../atoms/Button/Button'
import { DeleteIcon, PublishIcon, UploadIcon, CloseIcon } from '../../atoms/icons/icons'
import { Label } from '../../atoms/Label/Label'
import { Tag } from '../../atoms/Tag/Tag'
import { FormField } from '../../molecules/FormField/FormField'
import { PostCover } from '../../molecules/PostCover/PostCover'
import { TextAreaField } from '../../molecules/TextAreaField/TextAreaField'
import { Input } from '../../atoms/Input/Input'

export type PostFormValues = {
  title: string
  description: string
  code: string
  tags: string[]
  image: File | null
}

type PostFormProps = {
  onSubmit: (values: PostFormValues) => void
  onDiscard: () => void
  error?: string
  submitting?: boolean
}

const MAX_TAGS = 10
const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']

/** Formulário "Novo projeto": imagem de capa, título, descrição, código opcional e tags. */
export function PostForm({ onSubmit, onDiscard, error, submitting = false }: PostFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [code, setCode] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagDraft, setTagDraft] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string>()
  const [preview, setPreview] = useState<string>()
  const fileInput = useRef<HTMLInputElement>(null)

  // A pré-visualização é um endereço temporário do navegador: liberado ao trocar a imagem.
  const previewUrl = useRef<string>(undefined)
  useEffect(
    () => () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
    },
    [],
  )

  function selectImage(file: File | null) {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
    previewUrl.current = file ? URL.createObjectURL(file) : undefined
    setPreview(previewUrl.current)
    setImage(file)
  }

  function handleImage(file: File | undefined) {
    if (!file) return
    if (!IMAGE_TYPES.includes(file.type)) {
      setImageError('Use uma imagem PNG, JPEG ou WebP.')
    } else if (file.size > MAX_IMAGE_BYTES) {
      setImageError('A imagem deve ter até 2 MB.')
    } else {
      setImageError(undefined)
      selectImage(file)
    }
    // Permite escolher o mesmo arquivo de novo depois de removê-lo.
    if (fileInput.current) fileInput.current.value = ''
  }

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase()
    if (tag && !tags.includes(tag) && tags.length < MAX_TAGS) setTags([...tags, tag])
    setTagDraft('')
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTag(tagDraft)
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    // Tag digitada e não confirmada também vale.
    const draft = tagDraft.trim().toLowerCase()
    const allTags = draft && !tags.includes(draft) && tags.length < MAX_TAGS ? [...tags, draft] : tags
    onSubmit({ title: title.trim(), description: description.trim(), code, tags: allTags, image })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-lg bg-cinza-escuro p-4 lg:flex-row lg:p-8"
    >
      <div className="flex flex-col gap-4 lg:w-1/2">
        <PostCover src={preview} alt="Pré-visualização da capa" attached={false} size="detail" />
        <div className="flex flex-col gap-2">
          <input
            ref={fileInput}
            type="file"
            accept={IMAGE_TYPES.join(',')}
            aria-label="Imagem de capa"
            className="sr-only"
            onChange={(event) => handleImage(event.target.files?.[0])}
          />
          <Button
            variant="neutral"
            icon={<UploadIcon className="size-6" />}
            onClick={() => fileInput.current?.click()}
          >
            Carregar imagem
          </Button>
          {image && (
            <p className="flex items-center gap-2 text-base text-cinza-medio">
              {image.name}
              <button
                type="button"
                aria-label="Remover imagem"
                onClick={() => selectImage(null)}
                className="cursor-pointer"
              >
                <CloseIcon className="size-4" />
              </button>
            </p>
          )}
          {imageError && (
            <p role="alert" className="text-base text-erro">
              {imageError}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-10">
        <h1 className="text-2xl font-semibold text-offwhite">Novo projeto</h1>

        <div className="flex flex-col gap-6">
          <FormField
            label="Nome do projeto"
            name="title"
            placeholder="React zero to hero"
            required
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <TextAreaField
            label="Descrição"
            name="description"
            rows={6}
            required
            maxLength={2000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <TextAreaField
            label="Código (opcional)"
            name="code"
            rows={5}
            maxLength={10000}
            className="font-mono"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="Digite e tecle Enter"
                disabled={tags.length >= MAX_TAGS}
                value={tagDraft}
                onChange={(event) => setTagDraft(event.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => addTag(tagDraft)}
              />
            </div>
            {tags.length > 0 && (
              <ul aria-label="Tags do projeto" className="flex flex-wrap gap-4">
                {tags.map((tag) => (
                  <li key={tag}>
                    <Tag selected onClick={() => setTags(tags.filter((current) => current !== tag))}>
                      {tag}
                    </Tag>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {error && (
          <p role="alert" className="text-base text-erro">
            {error}
          </p>
        )}

        <div className="flex gap-6">
          <Button variant="outline" icon={<DeleteIcon className="size-6" />} onClick={onDiscard}>
            Descartar
          </Button>
          <Button type="submit" disabled={submitting} icon={<PublishIcon className="size-6" />}>
            {submitting ? 'Publicando…' : 'Publicar'}
          </Button>
        </div>
      </div>
    </form>
  )
}
