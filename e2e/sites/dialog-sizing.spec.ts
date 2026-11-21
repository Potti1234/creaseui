import { expect, test } from '@playwright/test'

const examples = [
  { trigger: 'Open Dialog', title: 'Edit profile', desktopWidth: 384 },
  { trigger: 'Share', title: 'Share link', desktopWidth: 448 },
  { trigger: 'Sticky Footer', title: 'Sticky Footer', desktopWidth: 512 },
] as const

for (const width of [320, 390, 639, 640, 1440]) {
  test(`dialog widths preserve viewport gutters and desktop caps at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/docs/components/dialog')

    for (const example of examples) {
      const trigger = page.getByRole('button', {
        name: example.trigger,
        exact: true,
      })
      await trigger.click()
      const dialog = page.getByRole('dialog', {
        name: example.title,
        exact: true,
      })
      const panel = dialog.locator('[data-slot="dialog-content"]')
      const expectedWidth = width < 640 ? width - 32 : example.desktopWidth
      await expect(panel).toBeVisible()
      await expect
        .poll(() =>
          panel.evaluate(element => {
            const box = element.getBoundingClientRect()
            return { x: box.x, width: box.width }
          }),
        )
        .toEqual({ x: (width - expectedWidth) / 2, width: expectedWidth })
      expect(
        await panel.evaluate(
          element => element.scrollWidth - element.clientWidth,
        ),
      ).toBe(0)

      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
      await expect(trigger).toBeFocused()
    }
  })
}

for (const width of [390, 1440]) {
  test(`settings dialog retains its wider size at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(`/blocks/preview/${testInfo.project.name}--sidebar-13`)
    const panel = page
      .getByRole('dialog', { name: 'Settings', exact: true })
      .locator('[data-slot="dialog-content"]')
    const expectedWidth = width < 640 ? width - 32 : 800
    await expect(panel).toBeVisible()
    await expect
      .poll(() =>
        panel.evaluate(element => {
          const box = element.getBoundingClientRect()
          return { x: box.x, width: box.width }
        }),
      )
      .toEqual({ x: (width - expectedWidth) / 2, width: expectedWidth })
  })
}
