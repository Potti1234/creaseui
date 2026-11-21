import { expect, test } from '@playwright/test'

test('single and bulk transfers recover only the source collection focus', async ({
  page,
}) => {
  await page.goto('/docs/components/transfer-list')
  const field = page.locator('#searchable [data-slot="transfer-list"]').first()
  const actions = field.locator('[data-transfer-list-action="selected"]')
  const search = field.getByRole('searchbox')
  await expect(actions).toHaveCount(12)
  const count = await actions.count()
  expect(count).toBeGreaterThan(2)
  const nextLabel = await actions.nth(2).getAttribute('aria-label')
  await actions.nth(1).focus()
  await page.keyboard.press('Enter')
  await expect(actions).toHaveCount(count - 1)
  await expect(
    field.getByRole('button', { name: nextLabel!, exact: true }),
  ).toBeFocused()
  await field
    .getByRole('button', { name: 'Clear', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click())
  await expect(actions).toHaveCount(0)
  await expect(search).toBeFocused()
  const available = field.locator('[data-transfer-list-action="available"]')
  const availableCount = await available.count()
  const nextAvailable = await available.nth(2).getAttribute('aria-label')
  await available.nth(1).focus()
  await page.keyboard.press('Enter')
  await expect(available).toHaveCount(availableCount - 1)
  await expect(
    field.getByRole('button', { name: nextAvailable!, exact: true }),
  ).toBeFocused()
  await field
    .getByRole('button', { name: 'Add all', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click())
  await expect(available).toHaveCount(0)
  await expect(search).toBeFocused()
  await field
    .getByRole('button', { name: 'Clear', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click())
  await expect(actions).toHaveCount(0)
  await expect(search).toBeFocused()
})
