import { expect, test } from '@playwright/test'

test('recovered action across a group heading stays visible in its panel', async ({
  page,
}) => {
  await page.goto('/docs/components/transfer-list')
  const field = page.locator('#searchable [data-slot="transfer-list"]').first()
  const panel = field.locator('[data-transfer-list-panel-body="available"]')
  const lost = field.getByRole('button', { name: 'Add Field 040', exact: true })
  const target = field.getByRole('button', {
    name: 'Add Field 041',
    exact: true,
  })
  await lost.focus()
  await panel.evaluate(
    (panel, id) => {
      const button = document.getElementById(id!)!
      const rect = button.getBoundingClientRect()
      const bounds = panel.getBoundingClientRect()
      panel.scrollTop += rect.bottom - bounds.bottom + 1
    },
    await lost.getAttribute('id'),
  )
  const pageScroll = await page.evaluate(() => window.scrollY)
  await page.keyboard.press('Enter')
  await expect(target).toBeFocused()
  await expect
    .poll(async () =>
      target.evaluate(button => {
        const panel = button.closest('[data-transfer-list-panel-body]')!
        const bounds = panel.getBoundingClientRect()
        const rect = button.getBoundingClientRect()
        return rect.top >= bounds.top && rect.bottom <= bounds.bottom
      }),
    )
    .toBe(true)
  expect(await page.evaluate(() => window.scrollY)).toBe(pageScroll)
})

test('single and bulk transfers recover only the source collection focus', async ({
  page,
}) => {
  await page.goto('/docs/components/transfer-list')
  const field = page.locator('#searchable [data-slot="transfer-list"]').first()
  const actions = field.locator('[data-transfer-list-action="selected"]')
  const search = field.getByRole('searchbox')
  await expect(actions).toHaveCount(12)
  const count = await actions.count()
  expect(count).toBeGreaterThan(2)
  const nextLabel = await actions.nth(2).getAttribute('aria-label')
  await actions.nth(1).focus()
  await page.keyboard.press('Enter')
  await expect(actions).toHaveCount(count - 1)
  await expect(
    field.getByRole('button', { name: nextLabel!, exact: true }),
  ).toBeFocused()
  await field
    .getByRole('button', { name: 'Clear', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click())
  await expect(actions).toHaveCount(0)
  await expect(search).toBeFocused()
  const available = field.locator('[data-transfer-list-action="available"]')
  const availableCount = await available.count()
  const nextAvailable = await available.nth(2).getAttribute('aria-label')
  await available.nth(1).focus()
  await page.keyboard.press('Enter')
  await expect(available).toHaveCount(availableCount - 1)
  await expect(
    field.getByRole('button', { name: nextAvailable!, exact: true }),
  ).toBeFocused()
  await field
    .getByRole('button', { name: 'Add all', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click())
  await expect(available).toHaveCount(0)
  await expect(search).toBeFocused()
  await field
    .getByRole('button', { name: 'Clear', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click())
  await expect(actions).toHaveCount(0)
  await expect(search).toBeFocused()
})
