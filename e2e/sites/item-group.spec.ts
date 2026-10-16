import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/* ItemGroup renders role=list and owns the list-item wrappers; Items keep
   their native semantics, so standalone Items carry no list role (docs
   image, group and link examples on every renderer). */
test('item groups keep list structure and native links', async ({ page }) => {
  await page.goto('/docs/components/item')
  const groups = page.locator('[data-slot="item-group"]')
  await expect(groups.first()).toBeVisible()
  const summary = await groups.evaluateAll(elements =>
    elements.map(group => ({
      items: group.querySelectorAll('[data-slot="item"]').length,
      listItems: [...group.children].filter(
        child =>
          child.getAttribute('role') === 'listitem' &&
          child.querySelector('[data-slot="item"]') !== null,
      ).length,
      unwrapped: [...group.children].filter(
        child =>
          child.getAttribute('role') !== 'listitem' ||
          getComputedStyle(child).display !== 'contents',
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
    expect(group.unwrapped).toBe(0)
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

test('standalone items keep native semantics', async ({ page }) => {
  await page.goto('/docs/components/item')
  await expect(page.locator('[data-slot="item"]').first()).toBeVisible()
  const standalone = await page
    .locator('[data-slot="item"]')
    .evaluateAll(elements =>
      elements
        .filter(item => item.closest('[data-slot="item-group"]') === null)
        .map(item => ({
          tag: item.tagName,
          role: item.getAttribute('role'),
          listParent: item.closest('[role="listitem"]') !== null,
        })),
    )
  expect(standalone.length).toBeGreaterThan(0)
  expect(standalone.some(item => item.tag === 'A')).toBe(true)
  for (const item of standalone) {
    expect(item.role, JSON.stringify(item)).toBeNull()
    expect(item.listParent, JSON.stringify(item)).toBe(false)
  }
  const results = await new AxeBuilder({ page })
    .include('main')
    .withRules([
      'aria-required-children',
      'aria-required-parent',
      'list',
      'listitem',
    ])
    .analyze()
  expect(results.violations).toEqual([])

  const link = page.locator('a[data-slot="item"]').filter({
    hasNot: page.locator('xpath=ancestor::*[@data-slot="item-group"]'),
  })
  await expect(link.first()).toHaveRole('link')
})
