const KEY = 'code-connect:access-token'

const listeners = new Set<() => void>()

function notify(): void {
  listeners.forEach((listener) => listener())
}

/** Avisa quando o token muda (login/logout aqui ou em outra aba). Usado por `useSession`. */
export function subscribeToken(listener: () => void): () => void {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

function read(storage: () => Storage): string | null {
  try {
    return storage().getItem(KEY)
  } catch {
    return null
  }
}

/** Token salvo (localStorage se "Lembrar-me", senão sessionStorage). */
export function getToken(): string | null {
  return read(() => localStorage) ?? read(() => sessionStorage)
}

export function setToken(token: string, remember: boolean): void {
  clearToken()
  try {
    ;(remember ? localStorage : sessionStorage).setItem(KEY, token)
  } catch {
    // Armazenamento indisponível: a sessão vale só até recarregar a página.
  }
  notify()
}

export function clearToken(): void {
  for (const storage of [() => localStorage, () => sessionStorage]) {
    try {
      storage().removeItem(KEY)
    } catch {
      // ignorado
    }
  }
  notify()
}
