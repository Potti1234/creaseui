import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/* ItemGroup renders role=list; every Item, linked or not, must be exposed
   as a list item while anchors keep their native link role (docs image,
   group and link examples on every renderer). */
test('item groups keep list structure and native links', async ({ page }) => {
  await page.goto('/docs/components/item')
  const groups = page.locator('[data-slot="item-group"]')
  await expect(groups.first()).toBeVisible()
  const summary = await groups.evaluateAll(elements =>
    elements.map(group => ({
      items: group.querySelectorAll('[data-slot="item"]').length,
      listItems: [...group.children].filter(
        child => child.getAttribute('role') === 'listitem',
      ).length,
      links: group.querySelectorAll('a[data-slot="item"]').length,
      linksWithRole: group.querySelectorAll('a[data-slot="item"][role]').length,
    })),
  )
  expect(summary.some(group => group.links > 0)).toBe(true)
  expect(summary.some(group => group.links === 0)).toBe(true)
  for (const group of summary) {
    expect(group.listItems, JSON.stringify(group)).toBe(group.items)
    expect(group.linksWithRole).toBe(0)
  }

  const results = await new AxeBuilder({ page })
    .include('[data-slot="item-group"]')
    .withRules([
      'aria-required-children',
      'aria-required-parent',
      'list',
      'listitem',
    ])
    .analyze()
  expect(results.violations).toEqual([])

  const linked = groups
    .filter({ has: page.locator('a[data-slot="item"]') })
    .first()
    .getByRole('listitem')
    .getByRole('link')
  expect(await linked.count()).toBeGreaterThan(1)
  await linked.first().focus()
  await page.keyboard.press('Tab')
  await expect(linked.nth(1)).toBeFocused()
})
