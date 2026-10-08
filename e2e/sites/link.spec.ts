import { expect, test } from '@playwright/test'

for (const width of [390, 1440]) {
  test(`Link variants and Crease UI tooltips work at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/docs/components/link')
    await page.mouse.move(0, 0)
    const underlined = page.getByRole('link', {
      name: 'Underlined documentation',
      exact: true,
    })
    await expect(underlined).toHaveAttribute('data-variant', 'underlined')
    await expect(underlined).toHaveCSS('text-decoration-line', 'underline')
    const normal = page
      .getByRole('link', { name: 'Documentation', exact: true })
      .first()
    await expect(normal).toHaveAttribute('data-variant', 'default')
    await expect(normal).toHaveCSS('text-decoration-line', 'none')
    await normal.hover()
    await expect(normal).toHaveCSS('text-decoration-line', 'underline')
    await page.mouse.move(0, 0)

    for (const [label, href, content] of [
      ['Settings', '/settings', 'Manage your application preferences'],
      ['Profile', '/profile', 'View and edit your profile'],
      ['Help', '/help', 'Browse help articles and support'],
    ] as const) {
      const link = page.getByRole('link', { name: label, exact: true })
      await link.evaluate(element =>
        element.scrollIntoView({ block: 'center', behavior: 'instant' }),
      )
      await expect(link).toHaveAttribute('href', href)
      await expect(link).not.toHaveAttribute('title')
      await expect(link).not.toHaveAttribute('type')
      await expect(page.locator('button a, a button')).toHaveCount(0)
      const before = await link.boundingBox()
      await link.focus()
      await expect(link).toBeFocused()
      const tooltip = page.getByRole('tooltip')
      await expect(tooltip).toHaveText(content)
      await expect(tooltip).toHaveAttribute('data-slot', 'tooltip-content')
      await expect(tooltip).toHaveCSS('font-size', '12px')
      await expect(link).toHaveAttribute(
        'aria-describedby',
        (await tooltip.getAttribute('id'))!,
      )
      await expect.poll(() => link.boundingBox()).toEqual(before)
      const bounds = (await tooltip.boundingBox())!
      if (label === 'Settings') expect(bounds.width).toBeGreaterThan(200)
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
      await link.press('Escape')
      await expect(tooltip).toHaveCount(0)
      await expect(link).toBeFocused()
      await link.evaluate(element => (element as HTMLElement).blur())
      await link.hover()
      await expect(tooltip).toHaveText(content)
      await page.mouse.move(0, 0)
      await expect(tooltip).toHaveCount(0)
    }

    const settings = page.getByRole('link', { name: 'Settings', exact: true })
    await settings.focus()
    await expect(settings).toBeFocused()
    await settings.press('Enter')
    await expect(page).toHaveURL(/\/settings$/)
    await page.goto('/docs/components/link')
    await page.getByRole('link', { name: 'Profile', exact: true }).click()
    await expect(page).toHaveURL(/\/profile$/)
    expect(errors).toEqual([])
  })
}
