import { expect, test } from '@playwright/test'

test('follows live OS color scheme until an explicit theme is selected', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'foldkit-devtools',
      '{"isOpen":false,"isFlattened":false}',
    )
  })
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  const root = page.locator('html')
  const toggle = page.getByRole('button', { name: 'Switch to light mode' })
  await expect(toggle).toBeVisible()
  await expect(root).toHaveClass(/dark/u)
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(root).not.toHaveClass(/dark/u)
  await expect(root).toHaveCSS('color-scheme', 'light')
  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expect(root).toHaveClass(/dark/u)
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('creaseui-theme')))
    .toBe('dark')
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(
    page.getByRole('button', { name: 'Switch to light mode' }),
  ).toBeVisible()
  await expect(root).toHaveClass(/dark/u)
  await expect(root).toHaveCSS('color-scheme', 'dark')
  expect(
    await page.evaluate(() => localStorage.getItem('creaseui-theme')),
  ).toBe('dark')
})
