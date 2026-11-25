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

test('tablecn extends the selection by keyboard and Shift-click', async ({
  page,
}, info) => {
  await page.goto(`/blocks/preview/${info.project.name}--tablecn-grid`)
  const grid = page.locator('[data-slot="grid"]').first()
  const row = (index: number) =>
    grid.locator(`[data-slot="grid-cell"][data-row-index="${index}"]`)
  await grid.focus()
  await page.keyboard.press('Control+Home')
  await page.keyboard.press('Shift+ArrowDown')
  await expect(row(0).first()).toHaveAttribute('aria-selected', 'true')
  await expect(row(1).first()).toHaveAttribute('aria-selected', 'true')
  await row(2)
    .first()
    .click({ modifiers: ['Shift'] })
  await expect(row(0).first()).toHaveAttribute('aria-selected', 'true')
  await expect(row(2).first()).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('ArrowDown')
  await expect(row(0).first()).toHaveAttribute('aria-selected', 'false')
  await expect(row(3).first()).toHaveAttribute('aria-selected', 'true')
})

test('tablecn copies, pastes, and undoes a range', async ({ page }, info) => {
  await page.goto(`/blocks/preview/${info.project.name}--tablecn-grid`)
  const grid = page.locator('[data-slot="grid"]').first()
  const cell = (row: number) =>
    grid.locator(`[data-slot="grid-cell"][data-row-index="${row}"]`).first()
  await grid.focus()
  await page.keyboard.press('Control+Home')
  await page.keyboard.press('Shift+ArrowDown')
  await expect(cell(1)).toHaveAttribute('aria-selected', 'true')
  const original = [await cell(0).innerText(), await cell(1).innerText()]
  const copied = await cell(1).evaluate(element => {
    const clipboardData = new DataTransfer()
    element.dispatchEvent(
      new ClipboardEvent('copy', {
        clipboardData,
        bubbles: true,
        cancelable: true,
      }),
    )
    return clipboardData.getData('text/plain')
  })
  expect(copied).toBe(original.join('\n'))
  await page.keyboard.press('Control+Home')
  await expect(cell(0)).toHaveAttribute('data-focused', 'true')
  await cell(0).evaluate(element => {
    const clipboardData = new DataTransfer()
    clipboardData.setData('text/plain', 'Pasted first\nPasted second')
    element.dispatchEvent(
      new ClipboardEvent('paste', {
        clipboardData,
        bubbles: true,
        cancelable: true,
      }),
    )
  })
  await expect(cell(0)).toHaveText('Pasted first')
  await expect(cell(1)).toHaveText('Pasted second')
  await page.keyboard.press('Control+z')
  await expect(cell(0)).toHaveText(original[0]!)
  await expect(cell(1)).toHaveText(original[1]!)
})

test('tablecn extends a range while dragging across cells', async ({
  page,
}, info) => {
  await page.goto(`/blocks/preview/${info.project.name}--tablecn-grid`)
  const grid = page.locator('[data-slot="grid"]').first()
  const cell = (row: number) =>
    grid.locator(`[data-slot="grid-cell"][data-row-index="${row}"]`).first()
  await expect(cell(0)).toBeVisible()
  const start = (await cell(0).boundingBox())!
  const end = (await cell(2).boundingBox())!
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, {
    steps: 8,
  })
  await page.mouse.up()
  for (const row of [0, 1, 2])
    await expect(cell(row)).toHaveAttribute('aria-selected', 'true')
  await expect(cell(3)).toHaveAttribute('aria-selected', 'false')
})
