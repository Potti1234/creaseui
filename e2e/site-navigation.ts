import { expect, type Page } from '@playwright/test'

export const visitRenderer = async (
  page: Page,
  renderer: 'StyleX' | 'Tailwind',
) => {
  const value = renderer.toLowerCase()
  if ((await page.locator('html').getAttribute('data-renderer')) === value)
    return
  await page
    .getByRole('link', { name: `View this page in ${renderer}` })
    .click()
  await expect(page.locator('html')).toHaveAttribute('data-renderer', value)
}
