import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { isUnauthorized } from '../services/api'
import { logout } from '../services/auth'

/** Ajuda as páginas abertas a visitantes a mandar para o login e voltar depois. */
export function useAuthGuard() {
  const navigate = useNavigate()
  const location = useLocation()

  const redirectToLogin = useCallback(() => {
    void navigate('/login', { state: { from: `${location.pathname}${location.search}` } })
  }, [navigate, location.pathname, location.search])

  /** Sessão expirada (401): encerra a sessão e leva ao login. Devolve se tratou o erro. */
  const handleUnauthorized = useCallback(
    (error: unknown): boolean => {
      if (!isUnauthorized(error)) return false
      logout()
      redirectToLogin()
      return true
    },
    [redirectToLogin],
  )

  return { redirectToLogin, handleUnauthorized }
}
