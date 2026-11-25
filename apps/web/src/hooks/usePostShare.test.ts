import { act, renderHook } from '@testing-library/react'
import { vi } from 'vitest'
import { usePostShare } from './usePostShare'

function mockClipboard(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
}

describe('usePostShare', () => {
  it('copies the post link and confirms', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    mockClipboard(writeText)
    const { result } = renderHook(() => usePostShare())
    expect(result.current.message).toBeUndefined()

    await act(() => result.current.share({ id: 'p1' }))

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/posts/p1`)
    expect(result.current.message).toBe('Link copiado!')
  })

  it('reports when the link cannot be copied', async () => {
    mockClipboard(() => Promise.reject(new Error('negado')))
    const { result } = renderHook(() => usePostShare())

    await act(() => result.current.share({ id: 'p1' }))

    expect(result.current.message).toBe('Não foi possível copiar o link.')
  })
})
