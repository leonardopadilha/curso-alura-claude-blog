import { getRedirectTarget } from './redirect'

describe('getRedirectTarget', () => {
  it('returns the internal path the user came from', () => {
    expect(getRedirectTarget({ from: '/publicar' })).toBe('/publicar')
    expect(getRedirectTarget({ from: '/?q=react&tags=css' })).toBe('/?q=react&tags=css')
  })

  it.each([undefined, null, {}, { from: 42 }, { from: 'https://evil.com' }, { from: '//evil.com' }])(
    'falls back to / for %j',
    (state) => {
      expect(getRedirectTarget(state)).toBe('/')
    },
  )
})
