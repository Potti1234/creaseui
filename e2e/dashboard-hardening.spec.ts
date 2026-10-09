import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('avatar initials and overflow counts pass contrast in both skins and themes', async ({
  page,
}) => {
  for (const origin of ['http://127.0.0.1:4173', 'http://127.0.0.1:4174']) {
    await page.goto(`${origin}/docs/components/avatar`)
    await expect(
      page.locator('[data-slot="avatar-fallback"]').first(),
    ).toBeVisible()
    for (const isDark of [false, true]) {
      await page.evaluate(
        dark => document.documentElement.classList.toggle('dark', dark),
        isDark,
      )
      const results = await new AxeBuilder({ page })
        .include('[data-slot="avatar-fallback"]')
        .include('[data-slot="avatar-group-count"]')
        .withRules(['color-contrast'])
        .analyze()
      expect(results.violations).toEqual([])
    }
  }
})
