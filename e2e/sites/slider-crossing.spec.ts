import { expect, test, type Locator, type Page } from '@playwright/test'

const drag = async (
  page: Page,
  slider: Locator,
  index: number,
  fraction: number,
) => {
  const thumb = slider.getByRole('slider').nth(index)
  await thumb.scrollIntoViewIfNeeded()
  const track = (await slider
    .locator('[data-slot="slider-track"]')
    .boundingBox())!
  const dot = (await thumb.boundingBox())!
  await page.mouse.move(dot.x + dot.width / 2, dot.y + dot.height / 2)
  await page.mouse.down()
  await expect(thumb).toHaveAttribute('data-dragging', '')
  await page.mouse.move(
    track.x + track.width * fraction,
    track.y + track.height / 2,
    { steps: 12 },
  )
  await page.mouse.up()
  await expect(thumb).not.toHaveAttribute('data-dragging')
}

const expectRange = async (slider: Locator, start: number, end: number) => {
  const fill = slider.locator('[data-slot="slider-range"]')
  await expect(fill).toHaveCount(1)
  await expect
    .poll(() =>
      fill.evaluate(element => ({
        left: (element as HTMLElement).style.left,
        right: (element as HTMLElement).style.right,
      })),
    )
    .toEqual({ left: `${start}%`, right: `${100 - end}%` })
}

for (const width of [390, 1440]) {
  test(`slider thumbs cross freely and fill the outermost range at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/docs/components/slider')
    const range = page.locator(
      '[data-slot="slider"]:has(#docs-slider-range-thumb-0-thumb)',
    )
    const rangeThumbs = range.getByRole('slider')
    await drag(page, range, 0, 0.8)
    await expect(rangeThumbs.nth(0)).toHaveAttribute('aria-valuenow', '80')
    await expect(rangeThumbs.nth(1)).toHaveAttribute('aria-valuenow', '50')
    await expectRange(range, 50, 80)
    await drag(page, range, 1, 0.2)
    await expect(rangeThumbs.nth(0)).toHaveAttribute('aria-valuenow', '80')
    await expect(rangeThumbs.nth(1)).toHaveAttribute('aria-valuenow', '20')
    await expectRange(range, 20, 80)
    await rangeThumbs.nth(1).focus()
    await expect(rangeThumbs.nth(1)).toBeFocused()
    await rangeThumbs.nth(1).press('End')
    await expect(rangeThumbs.nth(1)).toHaveAttribute('aria-valuenow', '100')
    await expect(rangeThumbs.nth(0)).toHaveAttribute('aria-valuenow', '80')
    await expectRange(range, 80, 100)
    await rangeThumbs.nth(0).press('End')
    await expect(rangeThumbs.nth(0)).toHaveAttribute('aria-valuenow', '100')
    await expectRange(range, 100, 100)
    await drag(page, range, 0, 0.6)
    await expect(rangeThumbs.nth(0)).toHaveAttribute('aria-valuenow', '60')
    await expect(rangeThumbs.nth(1)).toHaveAttribute('aria-valuenow', '100')
    await expectRange(range, 60, 100)

    const multi = page.locator(
      '[data-slot="slider"]:has(#docs-slider-multi-thumb-0-thumb)',
    )
    const thumbs = multi.getByRole('slider')
    for (const [index, fraction, values, bounds] of [
      [0, 0.9, [90, 20, 70], [20, 90]],
      [2, 0.1, [90, 20, 10], [10, 90]],
      [1, 1, [90, 100, 10], [10, 100]],
      [1, 0, [90, 0, 10], [0, 90]],
    ] as const) {
      await drag(page, multi, index, fraction)
      for (const [thumbIndex, value] of values.entries()) {
        await expect(thumbs.nth(thumbIndex)).toHaveAttribute(
          'aria-valuenow',
          String(value),
        )
      }
      await expectRange(multi, bounds[0], bounds[1])
    }
    expect(errors).toEqual([])
  })
}
