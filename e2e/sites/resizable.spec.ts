import { expect, test } from '@playwright/test'

test('a splitter keeps resizing outside the group and stops on release', async ({
  page,
}) => {
  await page.goto('/docs/components/resizable')
  const handle = page.locator('#handle').getByRole('separator')
  await handle.scrollIntoViewIfNeeded()
  await expect(handle).toHaveAttribute('aria-valuenow', '25')
  const box = (await handle.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  const outsideY = box.y > 16 ? box.y - 16 : box.y + box.height + 16
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 80, outsideY)
  await expect
    .poll(async () => Number(await handle.getAttribute('aria-valuenow')))
    .toBeGreaterThan(25)
  await page.mouse.up()

  const settled = await handle.getAttribute('aria-valuenow')
  await page.mouse.move(x, y)
  await expect(handle).toHaveAttribute('aria-valuenow', settled!)
  await handle.focus()
  await page.keyboard.press('ArrowRight')
  await expect(handle).toHaveAttribute(
    'aria-valuenow',
    String(Number(settled) + 2),
  )
})

test('an RTL nested drag only resizes its own group', async ({ page }) => {
  await page.goto('/docs/components/resizable')
  const group = page.locator('#rtl')
  const outer = group.getByRole('separator').first()
  const inner = group.getByRole('separator').last()
  await inner.scrollIntoViewIfNeeded()
  const box = (await inner.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await expect(outer).toHaveAttribute('aria-valuenow', '50')
  await expect(inner).toHaveAttribute('aria-valuenow', '25')
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x, y + 32)
  await page.mouse.up()
  await expect
    .poll(async () => Number(await inner.getAttribute('aria-valuenow')))
    .toBeGreaterThan(25)
  await expect(outer).toHaveAttribute('aria-valuenow', '50')
})
