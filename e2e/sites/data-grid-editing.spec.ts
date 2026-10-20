import { expect, test, type Page } from '@playwright/test'

/* Editing and deleting in a sorted Data Grid change the record on screen,
   and opening an editor keeps the current value (review R1/R2). */
const cell = (page: Page, row: number, column = 'name') =>
  page.locator(
    `[data-slot="grid-cell"][data-row-index="${String(row)}"][data-column-id="${column}"]`,
  )

const sortByName = async (page: Page) => {
  await page
    .locator('[data-slot="grid-header-cell"][data-column-id="name"] button')
    .first()
    .click()
  await page.getByText('Sort asc', { exact: true }).click()
  await page.keyboard.press('Escape')
}

test('sorted grid edits and deletes the displayed row', async ({
  page,
}, info) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(`/blocks/preview/${info.project.name}--tablecn-grid`)
  await expect(cell(page, 0)).toBeVisible()

  await sortByName(page)
  const names = await Promise.all(
    [0, 1, 2].map(async row => (await cell(page, row).innerText()).trim()),
  )
  expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names)

  /* double-click opens the editor on the current value; Enter keeps it */
  await cell(page, 0).dblclick()
  const editor = cell(page, 0).locator('input')
  await expect(editor).toHaveValue(names[0]!)
  await page.keyboard.press('Enter')
  await expect(cell(page, 0)).toHaveText(names[0]!)

  /* Enter and F2 from a focused cell keep the value too */
  for (const open of ['Enter', 'F2']) {
    await cell(page, 0).click()
    await page.keyboard.press(open)
    await expect(cell(page, 0).locator('input')).toHaveValue(names[0]!)
    await page.keyboard.press('Escape')
    await expect(cell(page, 0)).toHaveText(names[0]!)
  }

  /* a typed edit lands on the row shown first, not the first record */
  await cell(page, 0).dblclick()
  await cell(page, 0).locator('input').fill('AAA Edited')
  await page.keyboard.press('Enter')
  await expect(cell(page, 0)).toHaveText('AAA Edited')
  await expect(cell(page, 1)).toHaveText(names[1]!)

  /* the context menu deletes the row that was right-clicked */
  await cell(page, 0).click({ button: 'right' })
  await page.getByRole('menuitem', { name: 'Delete row' }).click()
  await expect(cell(page, 0)).toHaveText(names[1]!)
  await expect(cell(page, 1)).toHaveText(names[2]!)
  await expect(page.getByText('AAA Edited')).toHaveCount(0)
  expect(errors).toEqual([])
})

/* Review F2: an edit that moves the record in the sort order keeps later
   actions on the record that is now shown at each position. */
test('editing a sort key moves the record and later actions follow the screen', async ({
  page,
}, info) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(`/blocks/preview/${info.project.name}--tablecn-grid`)
  await expect(cell(page, 0)).toBeVisible()
  await sortByName(page)
  const names = await Promise.all(
    [0, 1, 2].map(async row => (await cell(page, row).innerText()).trim()),
  )

  await cell(page, 0).dblclick()
  await cell(page, 0).locator('input').fill('zzzz Moved')
  await page.keyboard.press('Enter')
  await expect(cell(page, 0)).toHaveText(names[1]!)

  await cell(page, 0).click({ button: 'right' })
  await page.getByRole('menuitem', { name: 'Delete row' }).click()
  await expect(cell(page, 0)).toHaveText(names[2]!)
  await expect(page.getByText(names[1]!, { exact: true })).toHaveCount(0)

  /* the moved record survived and now sorts last */
  await page
    .locator('[data-slot="grid-header-cell"][data-column-id="name"] button')
    .first()
    .click()
  await page.getByText('Sort desc', { exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(cell(page, 0)).toHaveText('zzzz Moved')
  expect(errors).toEqual([])
})

test('after an Enter commit the keyboard stays with the grid', async ({
  page,
}, info) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(`/blocks/preview/${info.project.name}--tablecn-grid`)
  await expect(cell(page, 0)).toBeVisible()
  await sortByName(page)
  const first = (await cell(page, 0).innerText()).trim()

  await cell(page, 0).dblclick()
  await cell(page, 0).locator('input').fill('zzzz Moved')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('grid', { name: 'Data grid' })).toBeFocused()

  /* undo straight from the keyboard brings the record back on top */
  await page.keyboard.press('Control+z')
  await expect(cell(page, 0)).toHaveText(first)
  await expect(page.getByRole('grid', { name: 'Data grid' })).toBeFocused()
  expect(errors).toEqual([])
})
