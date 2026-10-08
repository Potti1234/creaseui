import { expect, test, type Page } from '@playwright/test'

const activePanels = (page: Page) =>
  page.locator(
    '[data-slot="sheet-content"], [data-slot="sheet-panel"]:not([aria-hidden="true"])',
  )
const gotoSheets = async (page: Page) => {
  const path = test.info().project.metadata.sheetPath
  await page.goto(typeof path === 'string' ? path : '/docs/components/sheet')
}
const settled = async (page: Page) => {
  const panel = activePanels(page)
  await expect(panel).toHaveCount(1)
  await expect(panel).not.toHaveAttribute('data-transition')
  return panel
}
const close = async (page: Page) => {
  await page.keyboard.press('Escape')
  await expect(activePanels(page)).toHaveCount(0)
}

for (const width of [390, 1440]) {
  test(`sheet edge content fits and scrolls at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await gotoSheets(page)
    await page
      .getByRole('button', { name: 'Open', exact: true })
      .first()
      .click()
    const basic = await settled(page)
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue(
      'Pedro Duarte',
    )
    await expect(page.getByLabel('Username', { exact: true })).toHaveValue(
      '@peduarte',
    )
    const header = await basic
      .locator('[data-slot="sheet-header"]')
      .boundingBox()
    const label = await page.getByText('Name', { exact: true }).boundingBox()
    expect(Math.abs(label!.x - header!.x - 16)).toBeLessThan(1)
    await expect(basic.locator('[data-slot="sheet-footer"]')).toBeVisible()
    await basic
      .getByRole('button', { name: 'Save changes', exact: true })
      .click()
    await expect(activePanels(page)).toHaveCount(0)

    for (const name of ['Top', 'Right', 'Bottom', 'Left', 'فتح']) {
      await page.getByRole('button', { name, exact: true }).click()
      const panel = await settled(page)
      const box = (await panel.boundingBox())!
      expect(box.x).toBeGreaterThanOrEqual(-1)
      expect(box.x + box.width).toBeLessThanOrEqual(width + 1)
      if (name === 'Top' || name === 'Bottom') {
        expect(Math.abs(box.x)).toBeLessThan(1)
        expect(Math.abs(box.width - width)).toBeLessThan(1)
      }
      expect(await panel.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(
        true,
      )
      await expect(panel.locator('[data-slot="sheet-header"]')).toBeVisible()
      await expect(panel.locator('[data-slot="sheet-footer"]')).toBeVisible()
      if (name !== 'فتح') {
        expect(await panel.locator('p').count()).toBeGreaterThan(1)
      }
      const footer = (await panel
        .locator('[data-slot="sheet-footer"]')
        .boundingBox())!
      expect(footer.y).toBeGreaterThanOrEqual(0)
      expect(footer.y + footer.height).toBeLessThanOrEqual(1001)
      await close(page)
    }
    expect(errors).toEqual([])
  })

  test(`sheet flows retain full width, state and focus at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await gotoSheets(page)
    await page
      .getByRole('button', { name: 'Set up notifications', exact: true })
      .click()
    await settled(page)
    for (let round = 0; round < 2; round++) {
      await page.getByRole('button', { name: 'Continue', exact: true }).click()
      await page
        .getByRole('heading', { name: 'How often?', exact: true })
        .waitFor()
      const frequency = activePanels(page)
      await expect
        .poll(async () => (await frequency.boundingBox())?.width)
        .toBe(width)
      await expect(frequency).toBeFocused()
      await page.getByRole('radio', { name: 'Daily', exact: true }).click()
      await page.getByRole('button', { name: 'Continue', exact: true }).click()
      await page
        .getByRole('heading', {
          name: 'Where should we notify you?',
          exact: true,
        })
        .waitFor()
      await expect(activePanels(page)).toBeFocused()
      await page
        .getByRole('checkbox', { name: 'Text messages', exact: true })
        .click()
      await page.getByRole('button', { name: 'Back', exact: true }).click()
      await page
        .getByRole('heading', { name: 'How often?', exact: true })
        .waitFor()
      await expect(
        page.getByRole('radio', { name: 'Daily', exact: true }),
      ).toHaveAttribute('aria-checked', 'true')
      await page.getByRole('button', { name: 'Back', exact: true }).click()
      await page
        .getByRole('heading', { name: 'Set up notifications', exact: true })
        .last()
        .waitFor()
      await expect
        .poll(async () => (await activePanels(page).boundingBox())?.width)
        .toBe(width)
    }
    await expect(page.locator('[data-slot="sheet-panel"]')).toHaveCount(1)
    await close(page)
    await page
      .getByRole('button', { name: 'Set up notifications', exact: true })
      .click()
    await settled(page)
    await expect(page.locator('[data-slot="sheet-panel"]')).toHaveCount(1)
    await close(page)
    await page
      .getByRole('button', { name: 'Review settings', exact: true })
      .click()
    await settled(page)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(activePanels(page)).toBeFocused()
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await expect(activePanels(page)).toBeFocused()
    await close(page)
    expect(errors).toEqual([])
  })

  test(`sheet drag settles and closes with Drawer easing at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await gotoSheets(page)
    await page
      .getByRole('button', { name: 'Show directions', exact: true })
      .click()
    const panel = await settled(page)
    await expect(panel).toHaveCSS(
      'transition-timing-function',
      'cubic-bezier(0.32, 0.72, 0, 1)',
    )
    await expect(panel).toHaveCSS('transition-duration', '0.45s')
    const handle = panel.locator('[data-slot="sheet-handle"]')
    const original = (await handle.boundingBox())!
    const x = original.x + original.width / 2
    const y = original.y + original.height / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x, y + 380, { steps: 20 })
    await expect(panel).toHaveCSS('transition-property', 'none')
    await page.waitForTimeout(350)
    await page.mouse.move(x, y + 381)
    await page.mouse.up()
    await expect
      .poll(async () => (await handle.boundingBox())!.y)
      .toBeGreaterThan(original.y + 200)
    await page.waitForTimeout(600)
    const rest = (await handle.boundingBox())!
    await page.waitForTimeout(150)
    expect(Math.abs((await handle.boundingBox())!.y - rest.y)).toBeLessThan(1)
    await expect(panel).toHaveCSS(
      'transition-timing-function',
      'cubic-bezier(0.32, 0.72, 0, 1)',
    )
    await page.mouse.move(x, rest.y + rest.height / 2)
    await page.mouse.down()
    await page.mouse.move(x, 999, { steps: 8 })
    await page.mouse.up()
    await expect(activePanels(page)).toHaveCount(0)
    await page.getByRole('button', { name: 'Open sheet', exact: true }).click()
    await settled(page)
    await page.keyboard.press('Escape')
    await expect(activePanels(page)).toHaveAttribute('data-leave', '')
    await expect(activePanels(page)).toHaveCSS(
      'transition-timing-function',
      'cubic-bezier(0.32, 0.72, 0, 1)',
    )
    await expect(activePanels(page)).toHaveCount(0)
    expect(errors).toEqual([])
  })
}
