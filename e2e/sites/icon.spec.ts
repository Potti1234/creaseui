import { expect, test } from '@playwright/test'

/* Consumer finding: app code renders ordinary icons through the public Icon
   component on every renderer, with typed names, sizes and labels. */
test('Icon page renders named, sized and labelled icons', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/docs/components/icon')
  const main = page.locator('main')
  for (const name of ['search', 'bell', 'mail', 'settings', 'bookmark'])
    await expect(main.locator(`svg.lucide-${name}`).first()).toBeVisible()
  await expect(main.locator('svg[data-icon-missing]')).toHaveCount(0)
  const stars = main.locator('svg.lucide-star')
  const widths: Array<number> = []
  for (let index = 0; index < (await stars.count()); index += 1) {
    const box = await stars.nth(index).boundingBox()
    if (box !== null && box.width > 0) widths.push(Math.round(box.width))
  }
  for (const size of [8, 12, 14, 16, 20, 24, 32]) expect(widths).toContain(size)
  await expect(
    main.getByRole('img', { name: 'Verified account' }).first(),
  ).toBeVisible()
  await expect(main.locator('svg.lucide-search').first()).toHaveAttribute(
    'aria-hidden',
    'true',
  )
  expect(errors).toEqual([])
})
