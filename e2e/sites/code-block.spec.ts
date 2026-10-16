import { expect, test } from '@playwright/test'

test('code block gutter divider sits between the line numbers and the code', async ({
  page,
}) => {
  await page.goto('/docs/components/code-block')
  const code = page
    .locator('[data-slot="code-block-code"]:has([data-line])')
    .first()
  await expect(code).toBeVisible()
  const { divider, expected } = await code.evaluate(node => {
    const row = node.querySelector('[data-line]')!
    const gutter = Number.parseFloat(getComputedStyle(row).gridTemplateColumns)
    const rowStart =
      row.getBoundingClientRect().left - node.getBoundingClientRect().left
    const rem = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    )
    return {
      divider: Number.parseFloat(
        getComputedStyle(node, '::after').insetInlineStart,
      ),
      expected: rowStart + gutter + 0.75 * rem,
    }
  })
  expect(expected).toBeGreaterThan(30)
  expect(divider).toBeCloseTo(expected, 0)
})
