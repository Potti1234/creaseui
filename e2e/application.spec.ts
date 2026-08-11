import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const expectNoSeriousAccessibilityViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page }).analyze()
  const seriousViolations = results.violations.filter(
    ({ impact }) => impact === 'serious' || impact === 'critical',
  )

  expect(seriousViolations).toEqual([])
}

test('navigates the public catalog and passes an accessibility scan', async ({
  page,
}) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Beautiful components for foldkit.',
    }),
  ).toBeVisible()

  await page.getByRole('link', { name: 'Docs' }).first().click()
  await expect(page).toHaveURL(/\/docs\/components\/accordion$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Accordion' }),
  ).toBeVisible()

  await expectNoSeriousAccessibilityViolations(page)
})

test('persists the selected color scheme', async ({ page }) => {
  await page.goto('/')

  const themeToggle = page.getByRole('button', {
    name: /Switch to (light|dark) mode/,
  })
  const initialTheme = await themeToggle.getAttribute('aria-label')

  await themeToggle.click()
  await expect(themeToggle).not.toHaveAttribute('aria-label', initialTheme ?? '')

  const storedTheme = await page.evaluate(() =>
    localStorage.getItem('creaseui-theme'),
  )
  await page.reload()

  await expect(page.locator('html')).toHaveClass(
    storedTheme === 'dark' ? /dark/ : /^(?!.*dark)/,
  )
})

test('opens and closes a dialog with its accessible contract intact', async ({
  page,
}) => {
  await page.goto('/docs/components/dialog')
  await page.getByRole('button', { name: 'Open Dialog' }).first().click()

  const dialog = page.getByRole('dialog', { name: 'Edit profile' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute('aria-labelledby', /dialog-title$/)
  await expect(dialog).toHaveAttribute(
    'aria-describedby',
    /dialog-description$/,
  )
  await expectNoSeriousAccessibilityViolations(page)

  await dialog.getByRole('button', { name: 'Close' }).click()
  await expect(dialog).toBeHidden()
})
