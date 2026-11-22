import { expect, test } from '@playwright/test'

test('grouped Command navigates in visible group order after ranking', async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'foldkit-devtools',
      '{"isOpen":false,"isFlattened":false}',
    )
  })
  await page.goto('/docs/components/command')
  const example = page.locator('#groups')
  await example.getByRole('button', { name: 'Open Menu', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Command menu', exact: true })
  const input = dialog.getByRole('combobox')
  await input.fill('e')
  const options = dialog.getByRole('option')
  const label = '[data-slot="command-item"] > span:not([data-slot])'
  await expect(options.locator(label)).toHaveText([
    'Search Emoji',
    'Calendar',
    'Profile',
    'Settings',
  ])
  for (let index = 0; index < 4; index++) {
    if (index > 0) await input.press('ArrowDown')
    await expect(input).toHaveAttribute(
      'aria-activedescendant',
      (await options.nth(index).getAttribute('id')) ?? '',
    )
  }
  await input.press('ArrowUp')
  await expect(input).toHaveAttribute(
    'aria-activedescendant',
    (await options.nth(2).getAttribute('id')) ?? '',
  )
  await page.screenshot({
    path: testInfo.outputPath('grouped.png'),
  })
  await input.fill('missing')
  await expect(options).toHaveCount(0)
  await input.fill('')
  await expect(options.locator(label)).toHaveText([
    'Calendar',
    'Search Emoji',
    'Calculator',
    'Profile',
    'Billing',
    'Settings',
  ])
})

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
  await dialog.getByRole('combobox').fill('map styles openfreemap')
  await expect(
    dialog.getByRole('option', { name: /^Map Styles\s*OpenFreeMap presets/ }),
  ).toBeVisible()
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
  const scrollRegion = dialog.getByRole('listbox')
  await expect(scrollRegion).toHaveAttribute('tabindex', '0')
  await query.press('Tab')
  await expect(scrollRegion).toBeFocused()
  await query.focus()
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
