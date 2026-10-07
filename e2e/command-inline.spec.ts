import { expect, test } from '@playwright/test'

for (const renderer of ['tailwind', 'stylex'] as const) {
  const origin = `http://127.0.0.1:${renderer === 'stylex' ? '4174' : '4173'}`
  test(`${renderer} command dialogs keep results inline through focus and selection`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`${origin}/docs/components/command`)
    await page
      .getByRole('button', { name: 'Open Menu', exact: true })
      .first()
      .click()
    const dialog = page.getByRole('dialog', {
      name: 'Command menu',
      exact: true,
    })
    await expect(dialog.getByRole('option')).toHaveCount(3)
    const list = dialog.getByRole('listbox')
    await expect
      .poll(() => list.evaluate(node => getComputedStyle(node).position))
      .toBe('static')
    await expect(
      dialog.getByRole('button', { name: 'Toggle command list' }),
    ).toHaveCount(0)
    const query = dialog.getByRole('combobox')
    await query.fill('calendar')
    await expect(dialog.getByRole('option')).toHaveCount(1)
    await page.keyboard.press('Enter')
    await expect(dialog).toBeVisible()
    await expect(query).toHaveValue('calendar')
    await expect(list).toBeVisible()
    await query.fill('')
    await expect(dialog.getByRole('option')).toHaveCount(3)
    await dialog.getByRole('button', { name: 'Close', exact: true }).focus()
    await expect(dialog.getByRole('option')).toHaveCount(3)
    await query.focus()
    await page.keyboard.press('End')
    await expect(query).toHaveAttribute('aria-activedescendant', /item-2$/)
    await page.keyboard.press('Home')
    await expect(query).toHaveAttribute('aria-activedescendant', /item-0$/)
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    expect(errors).toEqual([])
  })
}
