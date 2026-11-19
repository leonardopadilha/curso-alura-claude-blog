import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// WCAG 2.x nível AA = regras A + AA de cada versão (2.0, 2.1 e 2.2).
const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const pages = [
  { name: 'Login', path: '/login' },
  { name: 'Cadastro', path: '/cadastro' },
]

async function scan(page: Page) {
  return new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze()
}

function summarize(violations: Awaited<ReturnType<typeof scan>>['violations']) {
  return violations.map((v) => ({
    regra: v.id,
    impacto: v.impact,
    descricao: v.help,
    ajuda: v.helpUrl,
    elementos: v.nodes.map((n) => n.target.join(' ')),
  }))
}

for (const { name, path } of pages) {
  test.describe(`${name} (${path})`, () => {
    test('estado inicial sem violações WCAG 2.x AA', async ({ page }, testInfo) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      const { violations } = await scan(page)
      await testInfo.attach('axe-violations.json', {
        body: JSON.stringify(summarize(violations), null, 2),
        contentType: 'application/json',
      })

      expect(summarize(violations)).toEqual([])
    })

    test('formulário enviado vazio sem violações WCAG 2.x AA', async ({ page }, testInfo) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      await page.locator('form button[type="submit"]').click()

      const { violations } = await scan(page)
      await testInfo.attach('axe-violations.json', {
        body: JSON.stringify(summarize(violations), null, 2),
        contentType: 'application/json',
      })

      expect(summarize(violations)).toEqual([])
    })
  })
}
