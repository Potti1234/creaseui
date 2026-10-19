import { expect, type Page } from '@playwright/test'

/* Style is a segmented row in the Themes pane. Under parallel load a click
   can land on a neighbouring option while the row settles, so retry until the
   board reports the requested style. */
export const selectStyle = async (page: Page, style: string): Promise<void> => {
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
