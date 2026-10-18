import { expect, test } from '@playwright/test'

import { LINT_CASES } from '../../src/docs/lint/cases'
import { LINT_CLI_CASES } from '../../src/docs/lint/cli-cases'
import { LINT_RULE_GROUPS } from '../../src/docs/lint/rules'

test('lint overview lists every rule in its group', async ({ page }) => {
  await page.goto('/docs/lint')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lint rules')
  for (const group of LINT_RULE_GROUPS) {
    await expect(
      page.getByText(group.label, { exact: true }).first(),
    ).toBeVisible()
    for (const rule of group.rules)
      await expect(
        page.locator(`a[href="/docs/lint/${rule.id}"]`).first(),
      ).toBeVisible()
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
