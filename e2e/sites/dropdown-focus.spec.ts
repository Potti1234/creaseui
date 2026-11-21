import { expect, test } from '@playwright/test'

/* A0.12: a pointer selection must return focus to the trigger so the next
   Tab continues after the trigger instead of restarting at the document. */
test('a pointer selection returns focus to the dropdown trigger', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/docs/components/dropdown-menu')
  const preview = page.locator('main [aria-label$="preview" i]').first()
  const trigger = preview
    .locator('[data-slot="dropdown-menu-trigger"]:visible')
    .first()
  await expect(trigger).toBeVisible()
  await trigger.click()
  const item = page
    .locator('[data-slot="dropdown-menu-content"] [role^="menuitem"]:visible')
    .first()
  await expect(item).toBeVisible()
  await item.click()
  await expect(trigger).toBeFocused()
})

test('dropdown closes on Escape and outside press and can reopen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/docs/components/dropdown-menu')
  const preview = page.locator('main [aria-label$="preview" i]').first()
  const trigger = preview.locator('[data-slot="dropdown-menu-trigger"]').first()
  const menu = preview.getByRole('menu')
  const backdrop = preview.locator('[data-slot="dropdown-menu-backdrop"]')

  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.focus()
  await trigger.press('Enter')
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('menuitem').first()).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')

  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()

  await trigger.click()
  await expect(menu).toBeVisible()
  await backdrop.click({ position: { x: 1, y: 1 } })
  await expect(menu).toHaveCount(0)
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()
})
