import axios, { isAxiosError } from 'axios'
import { getToken } from './tokenStorage'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

/** Mensagem em português para exibir ao usuário a partir de um erro da API. */
export function getApiErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) return 'Ocorreu um erro inesperado. Tente novamente.'
  if (!error.response) return 'Não foi possível conectar ao servidor.'

  switch (error.response.status) {
    case 400:
      return 'Verifique os dados informados.'
    case 401:
      return 'Email ou senha incorretos.'
    case 409:
      return 'Já existe uma conta com esse email.'
    default:
      return 'Ocorreu um erro inesperado. Tente novamente.'
  }
}

export function isUnauthorized(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401
}
