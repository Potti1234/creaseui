import { expect, test } from '@playwright/test'

test('toast unmount recovers to the next toast, then viewport, without stealing focus', async ({
  page,
}) => {
  await page.goto('/docs/components/toast')
  const section = page.locator('#stacking-and-queue')
  await section
    .getByRole('button', { name: 'Add 6 toasts', exact: true })
    .click()
  const viewport = section.getByRole('region', { name: 'Toast notifications' })
  const entries = viewport.locator(
    '[data-slot="toast-entry"]:not([data-limited])',
  )
  await expect(entries).toHaveCount(3)
  const nextId = await entries.nth(2).getAttribute('id')
  await entries
    .nth(1)
    .getByRole('button', { name: 'Dismiss notification' })
    .focus()
  await page.keyboard.press('Escape')
  await expect(page.locator(`[id="${nextId}"] button`).first()).toBeFocused()
  await section
    .getByRole('button', { name: 'Clear toasts', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click())
  await expect(viewport.locator('[data-slot="toast-entry"]')).toHaveCount(0)
  await expect(viewport).toBeFocused()
  const add = section.getByRole('button', { name: 'Add 6 toasts', exact: true })
  await add.click()
  await expect(entries).toHaveCount(3)
  await entries
    .nth(1)
    .getByRole('button', { name: 'Dismiss notification' })
    .focus()
  await page.keyboard.press('Escape')
  await add.focus()
  await expect(viewport.locator('[data-slot="toast-entry"]')).toHaveCount(5)
  await expect(add).toBeFocused()
})
