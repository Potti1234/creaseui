import { expect, test } from '@playwright/test'

for (const width of [390, 1440]) {
  test(`search filters options and preserves selections at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/docs/components/multi-selector')
    const trigger = page.getByRole('button', { name: 'Countries', exact: true })
    await trigger.click()
    const search = page.getByRole('combobox', {
      name: 'Search Countries',
      exact: true,
    })
    await expect(search).toBeFocused()
    await search.fill(' UNITED ')
    await expect(page.getByRole('option')).toHaveCount(3)
    await page
      .getByRole('option', { name: 'United States', exact: true })
      .click()
    await expect(trigger).toContainText('1 selected')
    await search.fill('germ')
    await page.getByRole('option', { name: 'Germany', exact: true }).click()
    await expect(trigger).toContainText('2 selected')
    await search.fill('united')
    const all = page.getByRole('option', { name: 'Select all', exact: true })
    await all.click()
    await expect(trigger).toContainText('3 selected')
    await all.click()
    await expect(trigger).toContainText('1 selected')
    await search.fill('')
    await expect(
      page.getByRole('option', { name: 'Germany', exact: true }),
    ).toHaveAttribute('aria-selected', 'true')
    await all.click()
    await expect(trigger).toContainText('10 selected')
    await all.click()
    await expect(trigger).toContainText('Select countries...')
    await search.fill('no-matching-country')
    await expect(
      page.getByText('No options found.', { exact: true }),
    ).toBeVisible()
    await expect(page.getByRole('option')).toHaveCount(0)
    await search.press('Escape')
    await expect(search).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await trigger.click()
    await expect(search).toBeFocused()
    await expect(search).toHaveValue('')
    await search.fill('germ')
    await search.press('ArrowDown')
    await expect(search).toHaveAttribute('aria-activedescendant', /-item-0$/)
    await search.press('ArrowDown')
    await expect(search).toHaveAttribute('aria-activedescendant', /-item-1$/)
    await search.press('Enter')
    await expect(trigger).toContainText('1 selected')
    await search.press('Escape')
    await expect(trigger).toBeFocused()
    expect(errors).toEqual([])
  })
}
