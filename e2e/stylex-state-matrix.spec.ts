import { expect, test } from '@playwright/test'
import type { Locator } from '@playwright/test'

type VisualState = Readonly<{
  backgroundColor: string
  boxShadow: string
  color: string
  cursor: string
  opacity: string
  transform: string
}>

const visualState = async (
  locator: Locator,
): Promise<VisualState> =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      backgroundColor: style.backgroundColor,
      boxShadow: style.boxShadow,
      color: style.color,
      cursor: style.cursor,
      opacity: style.opacity,
      transform: style.transform,
    }
  })

test('StyleX interaction and theme state matrix', async ({ page }, testInfo) => {
  test.slow()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/docs/components/button')
  await page
    .getByRole('group', { name: 'Preview styling engine' })
    .getByRole('button', { name: 'StyleX' })
    .click()

  const button = page.locator('#variants').getByRole('button', { name: 'Primary' })
  const disabled = page.locator('#loading').getByRole('button', { name: 'Save changes' })

  const matrix: Record<string, VisualState | Record<string, string>> = {}
  matrix.rest = await visualState(button)

  await button.hover()
  matrix.hover = await visualState(button)
  expect(matrix.hover.backgroundColor).not.toBe(matrix.rest.backgroundColor)

  await button.focus()
  matrix.focus = await visualState(button)
  expect(matrix.focus.boxShadow).not.toBe('none')

  const bounds = await button.boundingBox()
  expect(bounds).not.toBeNull()
  if (bounds !== null) {
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
    await page.mouse.down()
    await expect
      .poll(() => visualState(button).then(state => state.transform))
      .not.toBe('none')
    matrix.active = await visualState(button)
    await page.mouse.up()
  }

  matrix.disabled = await visualState(disabled)
  await expect(disabled).toBeDisabled()
  expect(matrix.disabled.cursor).toBe('not-allowed')
  expect(matrix.disabled.opacity).toBe('0.5')

  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  matrix.dark = await visualState(button)
  expect(matrix.dark.backgroundColor).not.toBe(matrix.rest.backgroundColor)

  await page.goto('/create-constrained')
  const themeScope = page.locator('[data-crease-board-theme]')
  await expect(themeScope).toBeVisible()
  const disclosure = themeScope.locator('button[aria-haspopup]').first()
  await expect(disclosure).toBeVisible()
  // The fixed primitive inspector intentionally overlays the wide demo board
  // on mobile. Force dispatch still exercises the Foldkit disclosure model.
  await disclosure.click({ force: true })

  const openPanel = themeScope
    .locator('[role="listbox"], [role="menu"], [data-slot$="-content"]')
    .filter({ visible: true })
    .first()
  await expect(openPanel).toBeVisible()
  expect(await openPanel.evaluate((element) => element.closest('[data-crease-board-theme]') !== null)).toBe(true)
  await expect(page.locator('#foldkit-portal-root [role="listbox"], #foldkit-portal-root [role="menu"]')).toHaveCount(0)

  matrix.openScopedTheme = await openPanel.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      backgroundColor: style.backgroundColor,
      color: style.color,
      portal: element.closest('#foldkit-portal-root') === null ? 'inline' : 'body',
      themeScope: element.closest('[data-crease-board-theme]') === null ? 'missing' : 'inherited',
    }
  })

  await testInfo.attach('stylex-state-matrix.json', {
    body: Buffer.from(JSON.stringify(matrix, null, 2)),
    contentType: 'application/json',
  })
})
