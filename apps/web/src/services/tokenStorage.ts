const KEY = 'code-connect:access-token'

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
}

export function clearToken(): void {
  for (const storage of [() => localStorage, () => sessionStorage]) {
    try {
      storage().removeItem(KEY)
    } catch {
      // ignorado
    }
  }
}
