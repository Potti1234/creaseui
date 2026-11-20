import { expect, test } from '@playwright/test'

for (const [renderer, port] of [
  ['Tailwind', 4173],
  ['StyleX', 4174],
] as const) {
  test(`toggle-group native Enter and Space activation (${renderer})`, async ({
    page,
  }) => {
    await page.goto(`http://127.0.0.1:${port}/docs/components/toggle-group`)
    const group = page
      .locator('[aria-label="Basic preview"]')
      .getByRole('group', {
        name: 'Text formatting',
        exact: true,
      })
      .first()
    const bold = group.getByRole('button', { name: 'Toggle bold', exact: true })
    const italic = group.getByRole('button', {
      name: 'Toggle italic',
      exact: true,
    })
    const strike = group.getByRole('button', {
      name: 'Toggle strikethrough',
      exact: true,
    })
    await bold.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(bold).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(italic).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(strike).toBeFocused()
    await expect(strike).toHaveAttribute('aria-pressed', 'false')
    await page.keyboard.press('Enter')
    await expect(strike).toHaveAttribute('aria-pressed', 'true')
    await expect(strike).toBeFocused()
    await page.keyboard.press('Space')
    await expect(strike).toHaveAttribute('aria-pressed', 'false')
    await expect(strike).toBeFocused()
    await expect(bold).toHaveAttribute('aria-pressed', 'false')
    await expect(italic).toHaveAttribute('aria-pressed', 'false')
  })
}
