import { expect, test } from '@playwright/test'
import type { Locator } from '@playwright/test'

const fitsContent = async (panel: Locator, viewportWidth: number) => {
  await expect(panel).toBeVisible()
  await expect(panel).not.toHaveAttribute('data-transition')
  await expect
    .poll(() =>
      panel.evaluate(element => {
        const box = element.getBoundingClientRect()
        return {
          horizontalOverflow: element.scrollWidth - element.clientWidth,
          verticalOverflow: element.scrollHeight - element.clientHeight,
          left: box.left,
          right: box.right,
        }
      }),
    )
    .toMatchObject({ horizontalOverflow: 0, verticalOverflow: 0 })
  const bounds = await panel.boundingBox()
  expect(bounds!.x).toBeGreaterThanOrEqual(0)
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewportWidth)
}

for (const width of [1280, 390, 320]) {
  test(`popover content fits navigation and form examples at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/docs/components/navigation-menu#popover-disclosure')
    await page
      .locator('#popover-disclosure')
      .getByRole('button', { name: 'Products', exact: true })
      .hover()
    const navigationPanel = page.locator('[data-slot="popover-content"]')
    await fitsContent(navigationPanel, width)
    for (const label of ['Analytics', 'Reports']) {
      const link = navigationPanel.getByRole('link', {
        name: label,
        exact: true,
      })
      const panelBox = await navigationPanel.boundingBox()
      const linkBox = await link.boundingBox()
      expect(linkBox!.x).toBeGreaterThan(panelBox!.x)
      expect(linkBox!.x + linkBox!.width).toBeLessThan(
        panelBox!.x + panelBox!.width,
      )
      expect(linkBox!.y + linkBox!.height).toBeLessThan(
        panelBox!.y + panelBox!.height,
      )
    }
    await expect(
      navigationPanel.getByRole('link', { name: 'Analytics', exact: true }),
    ).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(navigationPanel).toHaveCount(0)

    await page.goto('/docs/components/popover')
    await page
      .getByRole('button', { name: 'Open Popover', exact: true })
      .first()
      .click()
    const panel = page.locator('[data-slot="popover-content"]')
    await fitsContent(panel, width)
    await page.keyboard.press('Escape')
    await expect(panel).toHaveCount(0)
    await page
      .locator('#with-form')
      .getByRole('button', { name: 'Open Popover', exact: true })
      .click()
    await fitsContent(panel, width)
    await expect(panel.locator('input')).toHaveCount(2)
    for (const input of await panel.locator('input').all()) {
      const inputBox = await input.boundingBox()
      const panelBox = await panel.boundingBox()
      expect(inputBox!.x + inputBox!.width).toBeLessThan(
        panelBox!.x + panelBox!.width,
      )
    }
    await page.keyboard.press('Escape')
    await expect(panel).toHaveCount(0)
  })
}
