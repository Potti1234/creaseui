import { expect, test } from '@playwright/test'

test('menubar examples separate hover highlighting from the last clicked menu', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/docs/components/menubar')
  const bars = page.locator('[data-slot="menubar"]')
  await expect(bars.first()).toBeVisible()
  await expect(bars.locator('[aria-current="true"]')).toHaveCount(0)
  const transparent = 'rgba(0, 0, 0, 0)'

  for (const bar of await bars.all()) {
    await bar.scrollIntoViewIfNeeded()
    await page.mouse.move(1, 1)
    const triggers = bar.locator('[data-slot="dropdown-menu-trigger"]')
    const first = triggers.first()
    for (const trigger of await triggers.all()) {
      await expect(trigger).toHaveCSS('background-color', transparent)
      await expect(trigger).toHaveCSS('text-decoration-line', 'none')
    }
    await first.hover()
    await expect
      .poll(() => first.evaluate(el => getComputedStyle(el).backgroundColor))
      .not.toBe(transparent)
    await expect(bar.locator('[aria-current="true"]')).toHaveCount(0)
    await page.mouse.move(1, 1)
    await expect(first).toHaveCSS('background-color', transparent)
    await first.click()
    await expect(first).toHaveAttribute('aria-current', 'true')
    await expect(first).toHaveCSS('text-decoration-line', 'underline')

    if ((await triggers.count()) > 1) {
      const second = triggers.nth(1)
      await second.hover()
      await expect(first).toHaveAttribute('aria-current', 'true')
      await expect(second).not.toHaveAttribute('aria-current')
      await second.click()
      await expect(second).toHaveAttribute('aria-current', 'true')
      await expect(first).not.toHaveAttribute('aria-current')
      await expect(first).toHaveCSS('text-decoration-line', 'none')
    }
    await page.mouse.click(1, 1)
    await page.mouse.move(1, 1)
    await expect(bar.locator('[aria-current="true"]')).toHaveCount(1)
    await expect(bar.locator('[aria-expanded="true"]')).toHaveCount(0)
    for (const trigger of await triggers.all()) {
      await expect(trigger).toHaveCSS('background-color', transparent)
    }
  }
  expect(errors).toEqual([])
})

test('keyboard focus moves independently of menubar selection', async ({
  page,
}) => {
  await page.goto('/docs/components/menubar')
  const bar = page.locator('[data-slot="menubar"]').first()
  const triggers = bar.locator('[data-slot="dropdown-menu-trigger"]')
  await triggers.first().focus()
  await expect(bar.locator('[aria-current="true"]')).toHaveCount(0)
  await triggers.first().press('Enter')
  await expect(triggers.first()).toHaveAttribute('aria-current', 'true')
  await triggers.first().press('ArrowRight')
  await expect(triggers.nth(1)).toBeFocused()
  await expect(triggers.first()).toHaveAttribute('aria-current', 'true')
  await expect(triggers.nth(1)).not.toHaveAttribute('aria-current')
  await triggers.nth(1).press('Space')
  await expect(triggers.nth(1)).toHaveAttribute('aria-current', 'true')
  await expect(triggers.first()).not.toHaveAttribute('aria-current')
})
