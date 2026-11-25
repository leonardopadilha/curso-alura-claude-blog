import { useCallback, useState } from 'react'

/** Copia o link de um post e informa o resultado (para exibir ao usuário). */
export function usePostShare() {
  const [message, setMessage] = useState<string>()

  const share = useCallback(async (post: { id: string }) => {
    const url = `${window.location.origin}/posts/${post.id}`
    try {
      await navigator.clipboard.writeText(url)
      setMessage('Link copiado!')
    } catch {
      setMessage('Não foi possível copiar o link.')
    }
  }, [])

  return { message, share }
}
