/**
 * Mensagem para campo ausente. Sem isso o Zod diz "expected string, received
 * undefined". Devolver `undefined` mantém a mensagem padrão dos outros casos
 * (tipo errado, email inválido, tamanho mínimo...).
 */
export const requiredError = (issue: { input?: unknown }): string | undefined =>
  issue.input === undefined ? 'Field is required' : undefined;
