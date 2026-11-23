import { expect, test } from '@playwright/test'

test('tablecn grid supports row, grid and page navigation', async ({
  page,
}, info) => {
  await page.goto(`/blocks/preview/${info.project.name}--tablecn-grid`)
  const grid = page.locator('[data-slot="grid"]').first()
  const cells = grid.locator('[data-slot="grid-cell"][data-column-id]')
  await grid.focus()
  await page.keyboard.press('Control+Home')
  const columns = await cells.evaluateAll(cells => [
    ...new Set(cells.map(cell => cell.getAttribute('data-column-id'))),
  ])
  const active = grid.locator('[data-slot="grid-cell"][data-focused="true"]')
  const expectInGrid = async () => {
    await expect
      .poll(async () =>
        active.evaluate(cell => {
          const grid = cell.closest('[data-slot="grid"]')!
          const bounds = grid.getBoundingClientRect()
          const target = cell.getBoundingClientRect()
          return (
            target.top >= bounds.top &&
            target.bottom <= bounds.bottom &&
            target.left >= bounds.left &&
            target.right <= bounds.right
          )
        }),
      )
      .toBe(true)
  }
  await page.keyboard.press('End')
  await expect(active).toHaveAttribute('data-column-id', columns.at(-1)!)
  await expect(active).toHaveAttribute('data-row-index', '0')
  await page.keyboard.press('Control+End')
  await expect(active).toHaveAttribute('data-column-id', columns.at(-1)!)
  await expect(active).not.toHaveAttribute('data-row-index', '0')
  const lastRow = await grid
    .locator('[data-slot="grid-body"]')
    .evaluate(body => {
      const height = parseFloat((body as HTMLElement).style.height)
      const row = body.querySelector('[data-slot="grid-row"]') as HTMLElement
      return String(Math.round(height / parseFloat(row.style.height)) - 1)
    })
  await expect(active).toHaveAttribute('data-row-index', lastRow)
  await expectInGrid()
  if (info.project.name === 'tailwind')
    await page.screenshot({
      path: info.outputPath('grid-focus-ctrl-end.png'),
    })
  await page.keyboard.press('Control+Home')
  await expect(active).toHaveAttribute('data-row-index', '0')
  await expect(active).toHaveAttribute('data-column-id', columns[0]!)
  await expectInGrid()
  await page.keyboard.press('PageDown')
  await expect(active).not.toHaveAttribute('data-row-index', '0')
  await expectInGrid()
})
