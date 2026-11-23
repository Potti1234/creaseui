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

test('preset preview does not publish a color until it is chosen', async ({
  page,
}) => {
  await page.goto('/docs/components/color-picker')
  const example = page.locator('#swatch-trigger')
  await example.getByRole('button').first().click()
  const presets = page.getByRole('group', { name: 'Color presets' })
  const green = presets.getByRole('button', { name: 'Forest green' })
  const value = page
    .locator('#docs-color-picker-swatch-popover-panel')
    .getByRole('textbox', { name: 'Color value' })
  await expect(value).toHaveValue('#3b82f6')
  await green.hover()
  await expect(presets.locator('[aria-live]')).toHaveText('#15803d')
  await expect(value).toHaveValue('#3b82f6')
  await green.focus()
  await green.press('Enter')
  await expect(value).toHaveValue('#15803d')
  const blue = presets.getByRole('button', { name: 'Ocean blue' })
  const pink = presets.getByRole('button', { name: 'Rose pink' })
  const start = (await blue.boundingBox())!
  const end = (await pink.boundingBox())!
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, {
    steps: 8,
  })
  await expect(presets.locator('[aria-live]')).toHaveText('#be185d')
  await expect(value).toHaveValue('#15803d')
  await page.mouse.up()
  await expect(value).toHaveValue('#be185d')
})
