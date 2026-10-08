import { expect, test } from '@playwright/test'

for (const width of [390, 1440]) {
  test(`bottom-sheet selectors use a real Drawer at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/docs/components/multi-selector')
    const trigger = page.locator(
      '[data-slot="multi-selector-trigger"][aria-controls$="-drawer"]',
    )
    await trigger.click()
    const drawer = page.locator('[data-slot="drawer"][open]')
    const popup = drawer.locator('[data-slot="drawer-popup"]')
    const list = drawer.getByRole('listbox', { name: 'Teams', exact: true })
    await expect(drawer).toBeVisible()
    await expect(popup).toHaveAttribute('data-swipe-direction', 'down')
    await expect(
      drawer.locator('[data-slot="drawer-swipe-handle"]'),
    ).toBeVisible()
    await expect(list).toBeFocused()
    await expect(trigger).toHaveAttribute(
      'aria-controls',
      (await drawer.getAttribute('id'))!,
    )
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect
      .poll(async () => {
        const box = (await popup.boundingBox())!
        return Math.abs(box.y + box.height - 1000)
      })
      .toBeLessThan(2)
    await expect(popup).toHaveCSS('position', 'fixed')
    await drawer
      .getByRole('option', { name: 'Engineering', exact: true })
      .click()
    await expect(
      drawer.getByRole('option', { name: 'Engineering', exact: true }),
    ).toHaveAttribute('aria-selected', 'true')
    await drawer.getByRole('option', { name: 'Design', exact: true }).click()
    await expect(trigger).toContainText('2 selected')
    await expect(drawer).toBeVisible()
    await drawer.getByRole('button', { name: 'Done', exact: true }).click()
    await expect(drawer).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await trigger.press('ArrowDown')
    await expect(list).toBeFocused()
    await expect(
      drawer.getByRole('option', { name: 'Engineering', exact: true }),
    ).toHaveAttribute('aria-selected', 'true')
    await list.press('Escape')
    await expect(drawer).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await trigger.click()
    await drawer
      .locator('[data-slot="drawer-overlay"]')
      .click({ position: { x: 8, y: 8 } })
    await expect(drawer).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await trigger.click()
    await expect(list).toBeFocused()
    await expect
      .poll(async () => {
        const box = (await popup.boundingBox())!
        return Math.abs(box.y + box.height - 1000)
      })
      .toBeLessThan(2)
    const handle = drawer.locator('[data-slot="drawer-swipe-handle"]')
    const handleBox = (await handle.boundingBox())!
    const handleX = handleBox.x + handleBox.width / 2
    const handleY = handleBox.y + handleBox.height / 2
    await page.mouse.move(handleX, handleY)
    await page.mouse.down()
    await page.mouse.move(handleX, Math.min(994, handleY + 220), { steps: 8 })
    await page.mouse.up()
    await expect(drawer).toHaveCount(0)
    await expect(trigger).toBeFocused()
    expect(errors).toEqual([])
  })
}
