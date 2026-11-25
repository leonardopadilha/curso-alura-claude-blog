import { useSyncExternalStore } from 'react'
import { getToken, subscribeToken } from '../services/tokenStorage'

/** Estado da sessão atual: reage a login e logout (inclusive em outra aba). */
export function useSession(): { isLoggedIn: boolean } {
  const token = useSyncExternalStore(subscribeToken, getToken)
  return { isLoggedIn: token !== null }
}
