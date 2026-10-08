import { expect, test } from '@playwright/test'

for (const width of [390, 1440]) {
  test(`multi-selector popups are opaque and unclipped at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/docs/components/multi-selector')
    const trigger = page.locator('[data-slot="multi-selector-trigger"]').first()
    for (const mode of ['light', 'dark']) {
      if (mode === 'dark') {
        await page
          .getByRole('button', { name: 'Switch to dark mode', exact: true })
          .click()
      }
      await trigger.click()
      const panel = page.locator('[data-slot="select-content"]').first()
      await expect(panel).toBeVisible()
      await expect(panel).toHaveCSS('opacity', '1')
      expect(
        await panel.evaluate(element => {
          const canvas = document.createElement('canvas')
          canvas.width = canvas.height = 1
          const context = canvas.getContext('2d')!
          context.fillStyle = getComputedStyle(element).backgroundColor
          context.fillRect(0, 0, 1, 1)
          return context.getImageData(0, 0, 1, 1).data[3]
        }),
      ).toBe(255)
      const last = page.getByRole('option', { name: 'Created', exact: true })
      await last.click()
      await expect(last).toHaveAttribute(
        'aria-selected',
        mode === 'light' ? 'true' : 'false',
      )
      await expect(panel).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(panel).toHaveCount(0)
      await expect(trigger).toBeFocused()
    }
  })
}
