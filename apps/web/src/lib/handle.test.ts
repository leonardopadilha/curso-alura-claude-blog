import { toHandle } from './handle'

describe('toHandle', () => {
  it('uses the first name, lowercase and without accents', () => {
    expect(toHandle('Júlio Andrade')).toBe('@julio')
    expect(toHandle('  Márcia   Lima ')).toBe('@marcia')
  })
})
