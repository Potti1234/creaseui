import { expect, test, type Locator } from '@playwright/test'

const expectClearNavigation = async (nav: Locator) => {
  const layout = await nav.evaluate(element => {
    const bounds = element.getBoundingClientRect()
    const controls = [...element.querySelectorAll('a, button')].map(
      control => ({
        name: control.getAttribute('aria-label') ?? control.textContent?.trim(),
        rect: control.getBoundingClientRect().toJSON(),
      }),
    )
    return {
      bounds: bounds.toJSON(),
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      controls,
    }
  })
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1)
  for (const [index, control] of layout.controls.entries()) {
    expect(control.rect.width, control.name).toBeGreaterThan(0)
    expect(control.rect.height, control.name).toBeGreaterThan(0)
    expect(control.rect.left, control.name).toBeGreaterThanOrEqual(
      layout.bounds.left - 0.5,
    )
    expect(control.rect.right, control.name).toBeLessThanOrEqual(
      layout.bounds.right + 0.5,
    )
    expect(control.rect.top, control.name).toBeGreaterThanOrEqual(
      layout.bounds.top - 0.5,
    )
    expect(control.rect.bottom, control.name).toBeLessThanOrEqual(
      layout.bounds.bottom + 0.5,
    )
    for (const other of layout.controls.slice(index + 1)) {
      const horizontal =
        Math.min(control.rect.right, other.rect.right) -
        Math.max(control.rect.left, other.rect.left)
      const vertical =
        Math.min(control.rect.bottom, other.rect.bottom) -
        Math.max(control.rect.top, other.rect.top)
      expect(
        horizontal > 0.5 && vertical > 0.5,
        `${control.name} overlaps ${other.name}`,
      ).toBe(false)
    }
  }
  return layout
}

for (const width of [390, 1440]) {
  for (const theme of ['light', 'dark'] as const) {
    test(`top nav keeps links and actions clear at ${width}px in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto('/docs/components/top-nav')
      const navs = page.getByRole('navigation', {
        name: 'Main navigation',
        exact: true,
      })
      await expect(navs.first()).toBeVisible()
      const themeToggle = page.getByRole('button', {
        name: `Switch to ${theme} mode`,
        exact: true,
      })
      if (await themeToggle.isVisible()) await themeToggle.click()
      if (theme === 'dark')
        await expect(page.locator('html')).toHaveClass(/\bdark\b/u)
      else await expect(page.locator('html')).not.toHaveClass(/\bdark\b/u)
      await page.evaluate(() => document.fonts.ready)
      // Exercise both the start-items flex layout and centered grid layout.
      const centered = page
        .locator('[id="topnav-—-centered-navigation"]')
        .getByRole('navigation', { name: 'Main navigation', exact: true })
      await expect(centered).toHaveCount(1)
      for (const nav of [navs.first(), centered]) {
        await nav.scrollIntoViewIfNeeded()
        await expect(
          nav.getByRole('link', { name: 'Home', exact: true }),
        ).toBeVisible()
        await expect(
          nav.getByRole('button', { name: 'Search', exact: true }),
        ).toBeVisible()
        await expectClearNavigation(nav)
      }
      if (width === 1440) {
        const layout = await expectClearNavigation(navs.first())
        expect(layout.bounds.width).toBe(600)
        expect(layout.bounds.height).toBe(48)
        expect(
          new Set(layout.controls.map(control => control.rect.top)).size,
        ).toBe(1)
      }
      // Reflow moves dropdown triggers: neither inline anchor flip may fit.
      const hoverNav = page
        .locator('[id="topnav-—-hover-menu"]')
        .getByRole('navigation', { name: 'Main navigation', exact: true })
      await hoverNav
        .getByRole('button', { name: 'Products', exact: true })
        .hover()
      const menu = hoverNav.getByRole('menu', { name: 'Products', exact: true })
      await expect(menu).toBeVisible()
      const menuBounds = await menu.boundingBox()
      expect(menuBounds).not.toBeNull()
      expect(menuBounds!.x).toBeGreaterThanOrEqual(0)
      expect(menuBounds!.x + menuBounds!.width).toBeLessThanOrEqual(
        await page.evaluate(() => document.documentElement.clientWidth),
      )
      await menu.getByRole('menuitem').first().focus()
      await page.keyboard.press('Escape')
      await expect(menu).toHaveCount(0)
    })
  }
}
