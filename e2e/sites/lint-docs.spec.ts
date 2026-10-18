import { expect, test } from '@playwright/test'

import { LINT_CASES } from '../../src/docs/lint/cases'
import { LINT_CLI_CASES } from '../../src/docs/lint/cli-cases'
import { LINT_RULE_GROUPS } from '../../src/docs/lint/rules'

test('lint overview lists every rule in its group', async ({ page }) => {
  await page.goto('/docs/lint')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lint rules')
  const main = page.locator('main')
  for (const group of LINT_RULE_GROUPS) {
    await expect(
      main.getByText(group.label, { exact: true }).first(),
    ).toBeVisible()
    for (const rule of group.rules)
      await expect(
        main.locator(`a[href="/docs/lint/${rule.id}"]`).first(),
      ).toBeVisible()
  }
})

for (const path of ['/docs/components/button', '/docs/getting-started'])
  test(`docs sidebar on ${path} lists the lint rules`, async ({ page }) => {
    await page.goto(path)
    const sidebar = page.locator('aside nav').first()
    await expect(sidebar.locator('a[href="/docs/lint"]')).toBeVisible()
    for (const group of LINT_RULE_GROUPS) {
      await expect(
        sidebar.getByText(group.label, { exact: true }),
      ).toBeAttached()
      for (const rule of group.rules)
        await expect(
          sidebar.locator(`a[href="/docs/lint/${rule.id}"]`),
        ).toBeAttached()
    }
    const first = LINT_RULE_GROUPS[0]!.rules[0]!
    await sidebar.locator(`a[href="/docs/lint/${first.id}"]`).click()
    await expect(page).toHaveURL(new RegExp(`/docs/lint/${first.id}$`, 'u'))
    await expect(
      page.locator('[data-slot="heading"][data-level="1"]'),
    ).toHaveText(first.title)
  })

test('docs sidebar keeps its scroll position on lint and guide pages', async ({
  page,
}) => {
  await page.goto('/docs/components/button')
  const sidebar = page.locator('aside').first()
  await sidebar.evaluate(element => {
    element.scrollTop = 3000
  })
  for (const href of [
    '/docs/lint/no-raw-controls',
    '/docs/lint/theme',
    '/docs/getting-started',
    '/docs/lint',
    '/docs/components/accordion',
  ]) {
    await page
      .locator(`aside a[href="${href}"]`)
      .first()
      .evaluate(link => (link as HTMLAnchorElement).click())
    await expect(page).toHaveURL(new RegExp(`${href}$`, 'u'))
    await expect
      .poll(() =>
        page
          .locator('aside')
          .first()
          .evaluate(el => el.scrollTop),
      )
      .toBe(3000)
  }
})

for (const group of LINT_RULE_GROUPS)
  for (const rule of group.rules)
    test(`lint rule page ${rule.id}`, async ({ page }, info) => {
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))
      await page.goto(`/docs/lint/${rule.id}`)
      await expect(
        page.locator('[data-slot="heading"][data-level="1"]'),
      ).toHaveText(rule.title)
      const cases = [
        ...LINT_CASES.filter(
          item =>
            item.rule === rule.id &&
            item.renderers.includes(
              info.project.name as (typeof item.renderers)[number],
            ),
        ).map(item => item.id),
        ...LINT_CLI_CASES.filter(item => item.check === rule.id).map(
          item => item.id,
        ),
      ]
      if (cases.length === 0)
        await expect(page.getByText(/does not run on/u)).toBeVisible()
      for (const id of cases) {
        const bad = page.locator(`[data-lint-example="${id}-bad"]`)
        const good = page.locator(`[data-lint-example="${id}-good"]`)
        await expect(bad).toBeVisible()
        await expect(good).toBeVisible()
        await expect(
          bad.locator('[data-lint-diagnostics], [data-lint-terminal]'),
        ).toContainText(/crease\/|shadcn\/|problem|violation/u)
      }
      expect(errors).toEqual([])
    })
