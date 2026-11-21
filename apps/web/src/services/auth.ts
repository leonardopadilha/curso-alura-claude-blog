import { api } from './api'
import { clearToken } from './tokenStorage'

// Tipos espelhando os schemas Zod de apps/api (auth.schema.ts e user.schema.ts).
export type LoginRequest = { email: string; password: string }
export type TokenResponse = {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
}
export type CreateUserRequest = { name: string; email: string; password: string }
export type UserResponse = { id: string; name: string; email: string }

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>('/auth/token', data)
  return response.data
}

export async function signup(data: CreateUserRequest): Promise<UserResponse> {
  const response = await api.post<UserResponse>('/users', data)
  return response.data
}

export async function getCurrentUser(): Promise<UserResponse> {
  const response = await api.get<UserResponse>('/users/me')
  return response.data
}

export function logout(): void {
  clearToken()
}
