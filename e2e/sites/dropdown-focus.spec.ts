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
