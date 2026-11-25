import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { api, getApiErrorMessage, isUnauthorized } from './api'
import { setToken } from './tokenStorage'

function httpError(status: number) {
  return new AxiosError('fail', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    data: {},
    statusText: '',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  })
}

describe('api', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  async function sentAuthorization() {
    let header: unknown
    await api.get('/users/me', {
      adapter: (config) => {
        header = config.headers.get('Authorization')
        return Promise.resolve({
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        })
      },
    })
    return header
  }

  it('sends the Bearer token when there is one', async () => {
    setToken('jwt-1', false)
    expect(await sentAuthorization()).toBe('Bearer jwt-1')
  })

  it('sends no Authorization header without a token', async () => {
    expect(await sentAuthorization()).toBeUndefined()
  })
})

describe('getApiErrorMessage', () => {
  it.each([
    [400, 'Verifique os dados informados.'],
    [401, 'Email ou senha incorretos.'],
    [404, 'Não encontramos o que você procura.'],
    [409, 'Já existe uma conta com esse email.'],
    [413, 'A imagem deve ter até 2 MB.'],
    [415, 'Use uma imagem PNG, JPEG ou WebP.'],
    [500, 'Ocorreu um erro inesperado. Tente novamente.'],
  ])('maps status %i', (status, message) => {
    expect(getApiErrorMessage(httpError(status))).toBe(message)
  })

  it('reports a connection failure when there is no response', () => {
    expect(getApiErrorMessage(new AxiosError('Network Error'))).toBe(
      'Não foi possível conectar ao servidor.',
    )
  })

  it('falls back for non-axios errors', () => {
    expect(getApiErrorMessage(new Error('x'))).toBe(
      'Ocorreu um erro inesperado. Tente novamente.',
    )
  })
})

describe('isUnauthorized', () => {
  it('is true only for a 401 response', () => {
    expect(isUnauthorized(httpError(401))).toBe(true)
    expect(isUnauthorized(httpError(500))).toBe(false)
    expect(isUnauthorized(new Error('x'))).toBe(false)
  })
})
