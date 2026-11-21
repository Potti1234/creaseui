import { expect, test } from '@playwright/test'

for (const [renderer, baseUrl] of [
  ['Tailwind', process.env.TAILWIND_BASE_URL ?? 'http://127.0.0.1:4173'],
  ['StyleX', process.env.STYLEX_BASE_URL ?? 'http://127.0.0.1:4174'],
  ['Pleat', process.env.PLEAT_BASE_URL ?? 'http://127.0.0.1:4175'],
] as const) {
  test(`tree-list typeahead (${renderer})`, async ({ page }) => {
    await page.goto(`${baseUrl}/docs/components/tree-list`)
    const tree = page
      .getByRole('tree', { name: 'Project files', exact: true })
      .first()
    const src = tree.getByRole('treeitem', { name: 'src', exact: true })
    const ecole = tree.getByRole('treeitem', {
      name: 'École notes.md',
      exact: true,
    })
    const llama = tree.getByRole('treeitem', { name: 'Llama.md', exact: true })
    await src.focus()
    await page.keyboard.type('ecole', { delay: 0 })
    await expect(ecole).toBeFocused()
    await page.waitForTimeout(900)
    await page.keyboard.type('lla', { delay: 0 })
    await expect(llama).toBeFocused()
    await page.waitForTimeout(900)
    await page.keyboard.type('ecole', { delay: 0 })
    await expect(ecole).toBeFocused()
    await page.waitForTimeout(900)
    await page.keyboard.type('l')
    await page.waitForTimeout(18)
    await page.keyboard.type('l')
    await page.waitForTimeout(92)
    await page.keyboard.type('a')
    await expect(llama).toBeFocused()
    await page.waitForTimeout(550)
    await llama.evaluate(element => {
      for (const key of ['p', 'p']) {
        element.dispatchEvent(
          new KeyboardEvent('keydown', {
            key,
            bubbles: true,
            cancelable: true,
          }),
        )
      }
    })
    await expect(
      tree.getByRole('treeitem', { name: 'package.json', exact: true }),
    ).toBeFocused()
    await page.keyboard.type('p')
    await expect(
      tree.getByRole('treeitem', { name: 'public', exact: true }),
    ).toBeFocused()
  })
}
