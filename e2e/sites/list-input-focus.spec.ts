import { expect, test } from '@playwright/test'

test('remove then add keeps guest keys unique and recovery working', async ({
  page,
}) => {
  await page.goto('/docs/components/list-input')
  const field = page.locator('[data-slot="list-input"]').first()
  const rows = field.locator('[data-list-input-row]')
  const removes = field.locator('[data-list-input-remove]')
  await removes.first().click()
  await expect(rows).toHaveCount(1)
  await field.getByRole('button', { name: 'Add guest', exact: true }).click()
  await expect(rows).toHaveCount(2)
  const keys = await rows.evaluateAll(rows =>
    rows.map(row => row.getAttribute('data-list-input-row')),
  )
  expect(new Set(keys).size).toBe(2)
  await removes.first().focus()
  await page.keyboard.press('Enter')
  await expect(removes).toHaveCount(1)
  await expect(removes.first()).toBeFocused()
})

test('keyboard reorder keeps focus on the moved row handle', async ({
  page,
}) => {
  await page.goto('/docs/components/list-input')
  const field = page
    .locator('[data-slot="list-input"]')
    .filter({
      has: page.locator('[data-list-input-reorder]'),
    })
    .first()
  const add = field.getByRole('button', { name: 'Add guest', exact: true })
  await add.click()
  await add.click()
  const rows = field.locator('[data-list-input-row]')
  const key = await rows.first().getAttribute('data-list-input-row')
  const handle = field.locator(
    `[data-list-input-row="${key}"] [data-list-input-reorder]`,
  )
  await handle.focus()
  for (let index = 1; index <= 2; index++) {
    await page.keyboard.press('ArrowDown')
    await expect(rows.nth(index)).toHaveAttribute('data-list-input-row', key!)
    await expect(handle).toBeFocused()
  }
})

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
