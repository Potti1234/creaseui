import { expect, test } from '@playwright/test'

test('Layer Overflow keeps the input focused after the final token is removed', async ({
  page,
}) => {
  await page.goto('/docs/components/tokenizer')
  const preview = page.locator('#overflow [data-slot="tokenizer"]').nth(1)
  const removes = preview.locator('[data-slot="tokenizer-token-remove"]')
  await expect(removes).toHaveCount(6)
  await removes.first().focus()
  for (let remaining = 5; remaining >= 0; remaining--) {
    await page.keyboard.press('Enter')
    await expect(removes).toHaveCount(remaining)
    if (remaining > 0) await expect(removes.first()).toBeFocused()
  }
  const input = preview.getByRole('combobox')
  await expect(input).toBeFocused()
  await page.keyboard.type('Alice', { delay: 100 })
  await expect(input).toHaveValue('Alice')
  await expect(input).toBeFocused()
})

test('token removal recovers to the next token and then the input', async ({
  page,
}) => {
  await page.goto('/docs/components/tokenizer')
  const preview = page.locator('#overflow [data-slot="tokenizer"]').first()
  const removes = preview.locator('[data-slot="tokenizer-token-remove"]')
  await expect(removes).toHaveCount(6)
  const nextLabel = await removes.nth(2).getAttribute('aria-label')
  await removes.nth(1).focus()
  await page.keyboard.press('Enter')
  await expect(removes).toHaveCount(5)
  await expect(
    preview.getByRole('button', { name: nextLabel!, exact: true }),
  ).toBeFocused()
  for (let count = 4; count >= 1; count--) {
    await page.keyboard.press('Enter')
    await expect(removes).toHaveCount(count)
    await expect(removes.nth(count === 1 ? 0 : 1)).toBeFocused()
  }
  await expect(removes.first()).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(removes).toHaveCount(0)
  await expect(preview.getByRole('combobox')).toBeFocused()
})
