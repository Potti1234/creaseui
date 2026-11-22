import { expect, test } from '@playwright/test'

test('command keeps its live region node through zero-result transitions', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'foldkit-devtools',
      '{"isOpen":false,"isFlattened":false}',
    )
  })
  await page.goto('/docs/components/command')
  await page
    .locator('#shortcuts')
    .getByRole('button', { name: 'Open Menu', exact: true })
    .click()
  const root = page.locator('[data-slot="command"]:visible')
  const region = await root
    .locator(':scope > [aria-live="polite"]')
    .elementHandle()
  if (!region) throw new Error('Missing command live region')
  const input = root.getByRole('combobox')
  for (const [query, text, count] of [
    ['il', '2 results', 2],
    ['zzzz-no-results', 'No results', 0],
    ['il', '2 results', 2],
    ['', '', 3],
  ] as const) {
    await input.fill(query)
    await expect(root.getByRole('option')).toHaveCount(count)
    await expect
      .poll(() =>
        region.evaluate(node => ({
          connected: node.isConnected,
          firstChild: node.parentElement?.firstElementChild === node,
          text: node.textContent,
        })),
      )
      .toEqual({ connected: true, firstChild: true, text })
  }
})
