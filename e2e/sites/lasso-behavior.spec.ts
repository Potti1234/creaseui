import { expect, test } from '@playwright/test'

test('Lasso Grid example selects, adds, and cancels without affecting SpatialFocus', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'foldkit-devtools',
      '{"isOpen":false,"isFlattened":false}',
    ),
  )
  await page.goto('/docs/components/grid')
  const demo = page.locator('.docs-lasso-demo')
  const surface = demo.locator('.docs-lasso-surface')
  const tiles = demo.locator('.docs-lasso-tile')
  const selected = demo.locator('[data-selected="true"]')
  await surface.scrollIntoViewIfNeeded()
  const box = await surface.boundingBox()
  expect(box).not.toBeNull()
  const first = await tiles.nth(0).boundingBox()
  const second = await tiles.nth(1).boundingBox()
  expect(first).not.toBeNull()
  expect(second).not.toBeNull()
  await expect(selected).toHaveCount(0)
  await page.mouse.click(box!.x + 8, box!.y + 8)
  await expect(selected).toHaveCount(0)

  await page.mouse.move(box!.x + 8, box!.y + 8)
  await page.mouse.down()
  await page.mouse.move(first!.x + first!.width / 2, first!.y + 28, {
    steps: 8,
  })
  await expect(tiles.nth(0)).toHaveAttribute('data-touched', 'true')
  await page.mouse.up()
  await expect(selected).toHaveCount(1)
  await expect(tiles.nth(0)).toHaveAttribute('data-selected', 'true')

  await page.keyboard.down('Shift')
  await page.mouse.move(second!.x - 8, box!.y + 8)
  await page.mouse.down()
  await page.mouse.move(second!.x + second!.width / 2, second!.y + 28, {
    steps: 8,
  })
  await page.mouse.up()
  await page.keyboard.up('Shift')
  await expect(selected).toHaveCount(2)

  await page.mouse.move(box!.x + 8, box!.y + 8)
  await page.mouse.down()
  await page.mouse.move(box!.x + box!.width - 8, box!.y + box!.height - 8, {
    steps: 8,
  })
  await expect(demo.locator('[data-touched="true"]')).toHaveCount(12)
  await page.keyboard.press('Escape')
  await page.mouse.up()
  await expect(selected).toHaveCount(2)
  await expect(demo.locator('[data-touched="true"]')).toHaveCount(0)
  await expect(
    page.locator('[data-spatial-focus-demo] button[tabindex="0"]'),
  ).toHaveCount(1)
})
