import { expect, test } from '@playwright/test'

test('accepted row removal recovers to a surviving row and then Add', async ({
  page,
}) => {
  await page.goto('/docs/components/list-input')
  const field = page.locator('[data-slot="list-input"]').first()
  const removes = field.locator('[data-list-input-remove]')
  const add = field.getByRole('button', { name: 'Add guest', exact: true })
  await add.click()
  await expect(removes).toHaveCount(3)
  await removes.nth(1).focus()
  await page.keyboard.press('Enter')
  await expect(removes).toHaveCount(2)
  await expect(removes.nth(1)).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(removes).toHaveCount(1)
  await expect(removes.first()).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(removes).toHaveCount(0)
  await expect(add).toBeFocused()
})
