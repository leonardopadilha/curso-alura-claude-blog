/**
 * Destino depois do login: a página de onde o usuário veio (`state.from`), se
 * for um caminho interno. Qualquer outra coisa (inclusive `//outro-site`) vira `/`.
 */
export function getRedirectTarget(state: unknown): string {
  const from = (state as { from?: unknown } | null)?.from
  return typeof from === 'string' && /^\/(?!\/)/.test(from) ? from : '/'
}
