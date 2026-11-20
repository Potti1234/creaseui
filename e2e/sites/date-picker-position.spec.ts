import { expect, test } from '@playwright/test'

for (const width of [390, 639, 640, 1440]) {
  for (const dark of [false, true]) {
    test(`date picker keeps its responsive position at ${width}px in ${dark ? 'dark' : 'light'} mode`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto('/docs/components/date-picker')
      if (dark)
        await page
          .getByRole('button', { name: 'Switch to dark mode', exact: true })
          .click()
      const trigger = page.getByRole('button', { name: 'Pick a date' }).first()
      const panel = page.locator('[data-slot="popover-content"]')
      await trigger.click()
      await expect(panel).toBeVisible()
      await expect(panel).toHaveCSS(
        'position',
        width < 640 ? 'fixed' : 'absolute',
      )
      await expect
        .poll(() =>
          panel.evaluate(element => {
            const box = element.getBoundingClientRect()
            const trigger = document.querySelector(
              '[data-slot="popover-trigger"]',
            )!
            const anchor = trigger.getBoundingClientRect()
            const calendar = element.querySelector('[data-slot="calendar"]')!
            return {
              left: Math.round(box.left),
              right: Math.round(innerWidth - box.right),
              bottom: Math.round(innerHeight - box.bottom),
              anchorGap: Math.round(box.top - anchor.bottom),
              anchorLeft: Math.round(box.left - anchor.left),
              excessHeight: Math.round(
                box.height - calendar.getBoundingClientRect().height,
              ),
            }
          }),
        )
        .toMatchObject(
          width < 640
            ? { left: 12, right: 12, bottom: 12, excessHeight: 2 }
            : { anchorGap: 4, anchorLeft: 0, excessHeight: 2 },
        )

      await page.keyboard.press('Escape')
      await expect(panel).toBeHidden()
      await expect(trigger).toBeFocused()
      await trigger.click()
      await panel.getByRole('button', { name: /15, \d{4}/ }).click()
      await expect(panel).toBeHidden()
      await expect(trigger).toContainText(/15, \d{4}/)
    })
  }
}
