import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/docs/components/transfer-list')
})

test('the reorder handle moves a selected row by pointer', async ({ page }) => {
  const list = page
    .getByLabel('Visible fields preview', { exact: true })
    .getByRole('group', { name: 'Visible fields', exact: true })
  const rows = list.locator('[data-transfer-list-row]')
  const source = rows.filter({
    has: page.getByRole('button', { name: 'Reorder Name' }),
  })
  const handle = source.getByRole('button', { name: 'Reorder Name' })
  const target = rows.filter({
    has: page.getByRole('button', { name: 'Reorder Status' }),
  })

  await expect(rows).toHaveText([/Name/, /Owner/, /Status/])
  await handle.scrollIntoViewIfNeeded()
  const start = await handle.boundingBox()
  const end = await target.boundingBox()
  if (start === null || end === null)
    throw new Error('Reorder rows are not visible')

  const x = start.x + start.width / 2
  const y = start.y + start.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await expect(handle).toHaveAttribute('aria-pressed', 'true')
  await page.mouse.move(end.x + end.width / 2, end.y + end.height * 0.8)
  await expect(source).toHaveAttribute(
    'data-transfer-list-reorder-source',
    'true',
  )
  await expect(target).toHaveAttribute(
    'data-transfer-list-drop-target',
    'after',
  )
  await expect(rows).toHaveText([/Name/, /Owner/, /Status/])
  await page.mouse.up()

  await expect(rows).toHaveText([/Owner/, /Status/, /Name/])
  await expect(handle).toHaveAttribute('aria-pressed', 'false')
  await expect(list.locator('[aria-live="polite"]')).toHaveText(
    /Name dropped\. Position 3 of 3/,
  )
})

test('keyboard reorder cancels or commits without losing handle focus', async ({
  page,
}) => {
  const list = page
    .getByLabel('Visible fields preview', { exact: true })
    .getByRole('group', { name: 'Visible fields', exact: true })
  const rows = list.locator('[data-transfer-list-row]')
  const handle = list.getByRole('button', { name: 'Reorder Name' })
  const announcement = list.locator('[aria-live="polite"]')

  await handle.press('Space')
  await expect(handle).toHaveAttribute('aria-pressed', 'true')
  await expect(announcement).toHaveText(/Name grabbed/)
  await page.keyboard.press('ArrowDown')
  await expect(announcement).toHaveText(/Name moved to position 2 of 3/)
  await page.keyboard.press('Escape')
  await expect(announcement).toHaveText(/Name move cancelled/)
  await expect(rows).toHaveText([/Name/, /Owner/, /Status/])
  await expect(handle).toBeFocused()

  await handle.press('Enter')
  await expect(handle).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('ArrowDown')
  await expect(announcement).toHaveText(/Name moved to position 2 of 3/)
  await page.keyboard.press('Enter')
  await expect(rows).toHaveText([/Owner/, /Name/, /Status/])
  await expect(announcement).toHaveText(/Name dropped\. Position 2 of 3/)
  await expect(handle).toBeFocused()
})
