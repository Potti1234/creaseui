import { expect, test } from '@playwright/test'

test('the color pad captures a drag outside the track and settles on release', async ({
  page,
}) => {
  await page.goto('/docs/components/color-picker')
  const pad = page
    .locator('#inline')
    .getByRole('slider', { name: 'Color saturation and value' })
  await pad.scrollIntoViewIfNeeded()
  const box = (await pad.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await expect(pad).toHaveAttribute(
    'aria-valuetext',
    'saturation 50%, value 50%',
  )
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
  await expect(pad).not.toHaveAttribute(
    'aria-valuetext',
    'saturation 100%, value 100%',
  )
})
