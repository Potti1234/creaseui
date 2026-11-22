import { expect, test } from '@playwright/test'

test('action bar dismisses with Escape and retains roving focus', async ({
  page,
}) => {
  await page.goto('/docs/components/action-bar')
  const trigger = page
    .getByRole('button', { name: 'Select 3 tasks', exact: true })
    .first()
  await trigger.click()
  const toolbar = page.locator('[data-slot="action-bar"]')
  await expect(toolbar).toBeVisible()
  const markCompleted = toolbar.getByRole('button', {
    name: 'Mark completed',
    exact: true,
  })
  const assign = toolbar.getByRole('button', { name: 'Assign', exact: true })
  await expect(markCompleted).toHaveAttribute('tabindex', '0')
  await expect(assign).toHaveAttribute('tabindex', '-1')
  await markCompleted.focus()
  await page.keyboard.press('ArrowRight')
  await expect(assign).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(toolbar).toHaveCount(0)
  await expect(trigger).toBeVisible()
})
