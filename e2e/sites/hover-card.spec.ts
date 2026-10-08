import { expect, test } from '@playwright/test'

for (const width of [390, 1440]) {
  test(`hover cards float without moving their Button triggers at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/docs/components/hover-card')
    const triggers = page.locator('[data-slot="hover-card-trigger"]')
    await expect(triggers).toHaveCount(9)
    await expect(page.locator('button button')).toHaveCount(0)

    for (const trigger of await triggers.all()) {
      await trigger.evaluate(element =>
        element.scrollIntoView({ block: 'center', behavior: 'instant' }),
      )
      await expect(trigger.locator('[data-slot="button-content"]')).toHaveCount(
        1,
      )
      const before = await trigger.boundingBox()
      expect(before).not.toBeNull()
      await trigger.hover()
      const panel = page.locator(
        `[id="${await trigger.getAttribute('aria-controls')}"]`,
      )
      await expect(panel).toBeVisible()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect
        .poll(() =>
          panel.evaluate(element => getComputedStyle(element).position),
        )
        .toMatch(/absolute|fixed/)
      await expect.poll(() => trigger.boundingBox()).toEqual(before)
      const bounds = (await panel.boundingBox())!
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
      const button = before!
      expect(
        bounds.x + bounds.width <= button.x ||
          bounds.x >= button.x + button.width ||
          bounds.y + bounds.height <= button.y ||
          bounds.y >= button.y + button.height,
      ).toBe(true)
      await expect(panel).toHaveCSS('padding', '16px')
      // Verify the floating card is painted outside its preview frame, too.
      await expect
        .poll(() =>
          panel.evaluate(element => {
            const rect = element.getBoundingClientRect()
            const hit = document.elementFromPoint(
              rect.right - 4,
              rect.top + rect.height / 2,
            )
            return hit !== null && element.contains(hit)
          }),
        )
        .toBe(true)
      await panel.hover()
      await page.waitForTimeout(200)
      await expect(panel).toBeVisible()
      await page.mouse.move(0, 0)
      await expect(panel).toHaveCount(0)
      await trigger.focus()
      await expect(trigger).toBeFocused()
      await expect(panel).toBeVisible()
      await trigger.press('Escape')
      await expect(panel).toHaveCount(0)
      await expect(trigger).toBeFocused()
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await trigger.evaluate(element => (element as HTMLElement).blur())
    }
    expect(errors).toEqual([])
  })
}

test('horizontal cards fall back vertically on resize and restore their side', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/docs/components/hover-card')
  const trigger = page
    .getByRole('button', { name: 'Hover card on the left side', exact: true })
    .first()
  await trigger.scrollIntoViewIfNeeded()
  await trigger.focus()
  const panel = page.locator(
    `[id="${await trigger.getAttribute('aria-controls')}"]`,
  )
  await expect(panel).toHaveAttribute('data-placement', 'left')
  await page.setViewportSize({ width: 390, height: 1000 })
  await expect(panel).toHaveAttribute('data-placement', /top|bottom/)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await expect(panel).toHaveAttribute('data-placement', 'left')
})
