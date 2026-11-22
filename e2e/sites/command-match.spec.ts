import { expect, test } from '@playwright/test'

test('documentation search ranks an exact title before secondary field matches', async ({
  page,
}) => {
  await page.goto('/docs/components/command')
  await page.keyboard.press('Control+k')
  const dialog = page.getByRole('dialog', {
    name: 'Search documentation',
    exact: true,
  })
  await dialog.getByRole('combobox').fill('stat')
  await expect(dialog.getByRole('option').first()).toHaveText(
    /^StatA single KPI:/,
  )
})

test('Command ranks folded fuzzy matches and highlights labels with icons', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'foldkit-devtools',
      '{"isOpen":false,"isFlattened":false}',
    )
    localStorage.setItem('theme', 'light')
  })
  await page.goto('/docs/components/command')
  await page
    .getByRole('button', { name: 'Open Menu', exact: true })
    .first()
    .click()
  const dialog = page.getByRole('dialog', { name: 'Command menu', exact: true })
  const query = dialog.getByRole('combobox')
  const options = dialog.getByRole('option')
  await expect(options).toHaveText(['Calendar', 'Search Emoji', 'Calculator'])
  await query.fill('c')
  await expect(options).toHaveText(['Calendar', 'Calculator', 'Search Emoji'])
  await expect(dialog.locator('[data-slot="command-match"]')).toHaveText([
    'C',
    'C',
    'c',
  ])
  await query.fill('cal')
  await expect(options).toHaveText(['Calendar', 'Calculator'])
  await expect(dialog.locator('[data-slot="command-match"]')).toHaveText([
    'Cal',
    'Cal',
  ])
  await expect(options.first().locator('svg')).toHaveCount(1)
  await query.fill('cl')
  await expect(options).toHaveText(['Calendar', 'Calculator'])
  await expect(
    options.first().locator('[data-slot="command-match"]'),
  ).toHaveText(['C', 'l'])
  await query.fill('zzzz')
  await expect(options).toHaveCount(0)
  await expect(dialog.getByText('No results found.')).toBeVisible()
  await query.fill('')
  await expect(options).toHaveText(['Calendar', 'Search Emoji', 'Calculator'])
  await expect(dialog.locator('[data-slot="command-match"]')).toHaveCount(0)
})
