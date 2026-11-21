import { expect, test } from '@playwright/test'

for (const [renderer, port] of [
  ['Tailwind', 5173],
  ['StyleX', 5174],
  ['Pleat', 5175],
] as const) {
  test(`tree-list typeahead (${renderer})`, async ({ page }) => {
    await page.goto(`http://127.0.0.1:${port}/docs/components/tree-list`)
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
    await page.keyboard.type('ecole n')
    await expect(ecole).toBeFocused()
    await page.waitForTimeout(550)
    await page.keyboard.type('ll')
    await expect(llama).toBeFocused()
    await page.waitForTimeout(550)
    await page.keyboard.type('p')
    await expect(
      tree.getByRole('treeitem', { name: 'public', exact: true }),
    ).toBeFocused()
    await page.keyboard.type('p')
    await expect(
      tree.getByRole('treeitem', { name: 'package.json', exact: true }),
    ).toBeFocused()
  })
}
