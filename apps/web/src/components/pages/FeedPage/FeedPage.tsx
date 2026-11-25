import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useAuthGuard } from '../../../hooks/useAuthGuard'
import { usePostShare } from '../../../hooks/usePostShare'
import { useSession } from '../../../hooks/useSession'
import { getApiErrorMessage } from '../../../services/api'
import {
  likePost,
  listPosts,
  listTags,
  unlikePost,
  type PostSort,
  type PostSummary,
} from '../../../services/posts'
import { Button } from '../../atoms/Button/Button'
import { PageMeta } from '../../atoms/PageMeta/PageMeta'
import { Tabs } from '../../molecules/Tabs/Tabs'
import { FeedFilters } from '../../organisms/FeedFilters/FeedFilters'
import { PostGrid } from '../../organisms/PostGrid/PostGrid'

const PAGE_SIZE = 12
const SEARCH_DEBOUNCE_MS = 300
const SORT_TABS: { value: PostSort; label: string }[] = [
  { value: 'recent', label: 'Recentes' },
  { value: 'popular', label: 'Populares' },
]

/** Posts carregados. `key` diz para quais filtros/sessão eles valem; se mudou, ainda está carregando. */
type Feed = {
  key: string
  posts: PostSummary[]
  total: number
  page: number
  loadError?: string
}

/**
 * Feed público de posts. Filtros (busca, tags e ordem) ficam na URL e são
 * aplicados pelo backend: a busca é full text no banco.
 */
export function FeedPage() {
  const { isLoggedIn } = useSession()
  const { redirectToLogin, handleUnauthorized } = useAuthGuard()
  const { message: shareMessage, share } = usePostShare()
  const [params, setParams] = useSearchParams()

  const search = params.get('q') ?? ''
  const tagsParam = params.get('tags') ?? ''
  const selectedTags = tagsParam ? tagsParam.split(',') : []
  const sort: PostSort = params.get('sort') === 'popular' ? 'popular' : 'recent'

  const [searchText, setSearchText] = useState(search)
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [loaded, setLoaded] = useState<Feed>()
  const [loadingMore, setLoadingMore] = useState(false)
  const [actionError, setActionError] = useState<string>()

  // Ao entrar ou sair, recarrega para atualizar "curtido por mim".
  const key = `${search}|${tagsParam}|${sort}|${isLoggedIn}`
  const feed = loaded?.key === key ? loaded : undefined

  const updateParams = useCallback(
    (changes: Record<string, string | undefined>) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          for (const [key, value] of Object.entries(changes)) {
            if (value) next.set(key, value)
            else next.delete(key)
          }
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  // Sugestões de filtro: as tags mais usadas.
  useEffect(() => {
    let active = true
    listTags(8)
      .then((tags) => {
        if (active) setSuggestedTags(tags.map((tag) => tag.name))
      })
      .catch(() => {
        // Só uma sugestão: sem ela o feed continua funcionando.
      })
    return () => {
      active = false
    }
  }, [])

  // Espera a pessoa parar de digitar antes de buscar.
  useEffect(() => {
    if (searchText.trim() === search) return
    const timer = setTimeout(() => updateParams({ q: searchText.trim() }), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchText, search, updateParams])

  useEffect(() => {
    let active = true
    listPosts({ search, tags: tagsParam ? tagsParam.split(',') : [], sort, page: 1, limit: PAGE_SIZE })
      .then((data) => {
        if (active) setLoaded({ key, posts: data.items, total: data.total, page: 1 })
      })
      .catch((e) => {
        if (active) setLoaded({ key, posts: [], total: 0, page: 1, loadError: getApiErrorMessage(e) })
      })
    return () => {
      active = false
    }
  }, [search, tagsParam, sort, key])

  async function handleLoadMore() {
    if (!feed) return
    setLoadingMore(true)
    setActionError(undefined)
    try {
      const data = await listPosts({
        search,
        tags: selectedTags,
        sort,
        page: feed.page + 1,
        limit: PAGE_SIZE,
      })
      setLoaded((current) =>
        current?.key === key
          ? { ...current, posts: [...current.posts, ...data.items], total: data.total, page: data.page }
          : current,
      )
    } catch (e) {
      setActionError(getApiErrorMessage(e))
    } finally {
      setLoadingMore(false)
    }
  }

  async function handleLike(post: PostSummary) {
    // Visitantes veem o feed, mas curtir exige login.
    if (!isLoggedIn) {
      redirectToLogin()
      return
    }
    setActionError(undefined)
    try {
      const state = post.likedByMe ? await unlikePost(post.id) : await likePost(post.id)
      setLoaded((current) =>
        current
          ? {
              ...current,
              posts: current.posts.map((item) => (item.id === post.id ? { ...item, ...state } : item)),
            }
          : current,
      )
    } catch (e) {
      if (!handleUnauthorized(e)) setActionError(getApiErrorMessage(e))
    }
  }

  function handleToggleTag(tag: string) {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((current) => current !== tag)
      : [...selectedTags, tag]
    updateParams({ tags: next.join(',') })
  }

  function handleClear() {
    setSearchText('')
    updateParams({ q: undefined, tags: undefined })
  }

  const hasMore = feed !== undefined && feed.posts.length < feed.total
  const error = feed?.loadError ?? actionError

  return (
    <>
      <PageMeta
        title="Feed | Code Connect"
        description="Veja os projetos publicados pela comunidade Code Connect, busque por assunto e filtre por tags."
      />
      <h1 className="sr-only">Feed de projetos</h1>

      <FeedFilters
        search={searchText}
        onSearchChange={setSearchText}
        tags={suggestedTags}
        selectedTags={selectedTags}
        onToggleTag={handleToggleTag}
        onClear={handleClear}
      />

      <div className="flex flex-col gap-8">
        <Tabs
          label="Ordenar posts"
          items={SORT_TABS}
          value={sort}
          onChange={(value) => updateParams({ sort: value === 'recent' ? undefined : value })}
        />

        {shareMessage && (
          <p role="status" className="text-center text-base text-verde-destaque">
            {shareMessage}
          </p>
        )}
        {error && (
          <p role="alert" className="text-center text-base text-erro">
            {error}
          </p>
        )}

        {!feed ? (
          <p role="status" aria-busy="true" className="py-10 text-center text-xl text-cinza-medio">
            Carregando posts…
          </p>
        ) : (
          <PostGrid posts={feed.posts} onLike={handleLike} onShare={share} />
        )}

        {feed && !feed.loadError && hasMore && (
          <Button variant="neutral" onClick={handleLoadMore} disabled={loadingMore} className="mx-auto w-auto px-8">
            {loadingMore ? 'Carregando…' : 'Carregar mais'}
          </Button>
        )}
      </div>
    </>
  )
}
