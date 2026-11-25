import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { getToken } from '../services/tokenStorage'

/** Só renderiza `children` com token salvo; senão manda para /login e volta depois do login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()
  if (!getToken()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }
  return children
}
