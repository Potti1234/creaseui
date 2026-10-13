import { expect, type Page } from '@playwright/test'

/* Under parallel load a click can land on a neighbouring option while the
   panel settles, so retry until the trigger reports the requested style. */
export const selectStyle = async (page: Page, style: string): Promise<void> => {
  const trigger = page.locator('#create-style-picker-button')
  await expect(async () => {
    if ((await trigger.getAttribute('aria-expanded')) !== 'true')
      await trigger.click()
    await page
      .locator('#create-style-picker-panel button', {
        hasText: new RegExp(`^${style}$`, 'i'),
      })
      .first()
      .click({ timeout: 5000 })
    await expect(trigger).toContainText(new RegExp(style, 'i'), {
      timeout: 2000,
    })
  }).toPass({ timeout: 30_000 })
}
