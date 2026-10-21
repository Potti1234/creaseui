import { expect, type Page } from '@playwright/test'

/* The customizer opens on the Tokens pane; Style/Icons live in Themes. */
export const openThemesPane = async (page: Page): Promise<void> => {
  await page
    .locator('button', { hasText: /^Themes$/u })
    .first()
    .click()
  await expect(page.locator('[data-seg="Style"]')).toBeVisible()
}

/* Style is a segmented row in the Themes pane. Under parallel load a click
   can land on a neighbouring option while the row settles, so retry until the
   board reports the requested style. */
export const selectStyle = async (page: Page, style: string): Promise<void> => {
  await openThemesPane(page)
  const row = page.locator('[data-seg="Style"]')
  const board = page
    .locator('[data-crease-board-theme], .create-board-theme')
    .first()
  await expect(async () => {
    await row
      .locator('button', { hasText: new RegExp(`^${style}$`, 'i') })
      .click({ timeout: 5000 })
    await expect(board).toHaveAttribute('data-crease-style', style, {
      timeout: 2000,
    })
  }).toPass({ timeout: 30_000 })
}
