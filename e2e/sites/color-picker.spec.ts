import { expect, test } from '@playwright/test'

test('the color pad keeps physical saturation direction on an RTL page', async ({
  page,
}) => {
  await page.goto('/docs/components/color-picker')
  await page.evaluate(() => {
    document.documentElement.dir = 'rtl'
  })
  const surface = page.locator('#inline [data-slot="color-picker-area"]')
  const thumb = surface.getByRole('slider', {
    name: 'Color saturation and value',
  })
  await surface.scrollIntoViewIfNeeded()
  await expect(surface).toHaveCSS('direction', 'ltr')
  const box = (await surface.boundingBox())!
  await page.mouse.click(box.x + box.width * 0.1, box.y + box.height / 2)
  await expect(thumb).toHaveAttribute(
    'aria-valuetext',
    'saturation 10%, value 50%',
  )
  const before = (await thumb.boundingBox())!
  expect(
    Math.abs(before.x + before.width / 2 - (box.x + box.width * 0.1)),
  ).toBeLessThan(1.1)
  await page.keyboard.press('ArrowRight')
  await expect(thumb).toHaveAttribute(
    'aria-valuetext',
    'saturation 11%, value 50%',
  )
  const after = (await thumb.boundingBox())!
  expect(after.x).toBeGreaterThan(before.x)
})

test('the color pad captures a drag outside the track and settles on release', async ({
  page,
}) => {
  await page.goto('/docs/components/color-picker')
  const surface = page.locator('#inline [data-slot="color-picker-area"]')
  const pad = surface.getByRole('slider', {
    name: 'Color saturation and value',
  })
  await pad.scrollIntoViewIfNeeded()
  const box = (await surface.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await expect(pad).toHaveAttribute(
    'aria-valuetext',
    'saturation 50%, value 50%',
  )
  await expect(pad).toBeFocused()
  await expect(pad).toHaveAttribute('style', /--area-y:\s*0\.5/u)
  await page.mouse.move(box.x + box.width + 10, box.y - 10)
  await page.mouse.up()
  await expect(pad).toHaveAttribute(
    'aria-valuetext',
    'saturation 100%, value 100%',
  )

  await page.mouse.move(x, y)
  await expect(pad).toHaveAttribute(
    'aria-valuetext',
    'saturation 100%, value 100%',
  )
  await pad.focus()
  await page.keyboard.press('ArrowDown')
  await expect(pad).toHaveAttribute(
    'aria-valuetext',
    'saturation 100%, value 99%',
  )
  await page.keyboard.press('Shift+ArrowLeft')
  await expect(pad).toHaveAttribute(
    'aria-valuetext',
    'saturation 90%, value 99%',
  )
  await page.keyboard.press('PageDown')
  await expect(pad).toHaveAttribute(
    'aria-valuetext',
    'saturation 90%, value 89%',
  )
  await page.keyboard.press('Home')
  await expect(pad).toHaveAttribute('aria-valuenow', '0')
  await page.keyboard.press('End')
  await expect(pad).toHaveAttribute('aria-valuenow', '100')
  await page.keyboard.press('Control+ArrowDown')
  await expect(pad).toHaveAttribute(
    'aria-valuetext',
    'saturation 100%, value 89%',
  )
})
