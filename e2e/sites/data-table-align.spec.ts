import { expect, test, type Locator } from '@playwright/test'

// Header and body cells share one column alignment in LTR and RTL. Default
// columns follow the writing direction; `align: 'right'` stays physical.
const columnAlignments = (table: Locator) =>
  table.evaluate(element => {
    const headers = [...element.querySelectorAll('thead th')]
    const row = element.querySelector('tbody tr')
    const cells = row ? [...row.querySelectorAll('td')] : []
    const offset = cells.length - headers.length
    return headers.map((header, index) => ({
      header: header.textContent?.trim() ?? '',
      head: getComputedStyle(header).textAlign,
      cell: getComputedStyle(cells[index + offset]!).textAlign,
    }))
  })

for (const direction of ['ltr', 'rtl'] as const) {
  test(`data table header and cells align together in ${direction}`, async ({
    page,
  }) => {
    await page.goto('/docs/components/data-table')
    const table =
      direction === 'rtl'
        ? page.locator('[dir="rtl"] table').first()
        : page.locator('table').first()
    await table.scrollIntoViewIfNeeded()
    // The leading selection column is centred by design.
    const columns = (await columnAlignments(table)).filter(
      column => column.header !== '',
    )
    const amount = columns.at(-1)!
    expect(amount).toMatchObject({ head: 'right', cell: 'right' })
    for (const column of columns.slice(0, -1)) {
      expect(column.head, column.header).toBe(column.cell)
      expect(['start', direction === 'rtl' ? 'right' : 'left']).toContain(
        column.head,
      )
    }
  })
}
