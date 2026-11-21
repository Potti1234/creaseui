import { expect, test } from '@playwright/test'

test('create preset shuffle updates executable output and preview without changing style', async ({
  page,
}) => {
  await page.goto('/create')
  const token = page.getByText(/^--preset [abc]/u)
  const before = await token.innerText()
  const board = page.locator('[data-slot="capture-target"]')
  await expect(board).toHaveAttribute('data-crease-style', 'nova')
  await expect(board).toHaveCSS('--radius', '0.625rem')

  await page.evaluate(() => {
    Math.random = () => 0
  })
  await page.getByRole('button', { name: 'Shuffle' }).click()
  await expect(token).not.toHaveText(before)
  await expect(board).toHaveAttribute('data-crease-style', 'nova')
  await expect(board).toHaveCSS('--radius', '0')
  await expect(
    page.getByRole('button', { name: 'Copy Registry JSON' }),
  ).toBeVisible()
})
