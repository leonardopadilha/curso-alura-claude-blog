import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { getToken } from '../services/tokenStorage'

/** Só renderiza `children` com token salvo; senão manda para /login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />
  return children
}
