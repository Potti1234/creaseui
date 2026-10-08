import { expect, test } from '@playwright/test'

for (const width of [390, 1440]) {
  test(`zoomed lightbox panning stays within the image at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/docs/components/lightbox')
    await page
      .getByRole('button', { name: 'Open zoomable image', exact: true })
      .click()
    const frame = page.locator('[data-slot="lightbox-zoom-frame"]').last()
    const image = frame.locator('img')
    await image.evaluate(element => element.decode())
    await frame.dblclick()
    await expect(frame).toHaveAttribute('aria-pressed', 'true')

    const geometry = () =>
      frame.evaluate(element => {
        const image = element.querySelector('img')!
        const transform = new DOMMatrixReadOnly(
          getComputedStyle(image).transform,
        )
        const frame = element.getBoundingClientRect()
        const media = image.getBoundingClientRect()
        return {
          scale: transform.a,
          x: transform.e,
          y: transform.f,
          maxX: (image.offsetWidth * 2 - element.clientWidth) / 2,
          maxY: (image.offsetHeight * 2 - element.clientHeight) / 2,
          coversFrame:
            media.left <= frame.left + 1 &&
            media.top <= frame.top + 1 &&
            media.right >= frame.right - 1 &&
            media.bottom >= frame.bottom - 1,
        }
      })
    await expect.poll(async () => (await geometry()).scale).toBe(2)
    const box = (await frame.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    // Continue dragging outside the image frame: pointer capture must retain the drag.
    await page.mouse.move(1, 1, { steps: 12 })
    await expect
      .poll(async () => {
        const bounds = await geometry()
        return (
          Math.abs(bounds.x + bounds.maxX) < 1 &&
          Math.abs(bounds.y + bounds.maxY) < 1
        )
      })
      .toBe(true)
    await expect.poll(async () => (await geometry()).coversFrame).toBe(true)

    // Even a large overshoot must not create a dead zone when reversing.
    const edge = await geometry()
    await page.mouse.move(21, 21, { steps: 2 })
    await expect
      .poll(async () => (await geometry()).x)
      .toBeCloseTo(edge.x + 20, 0)
    await expect
      .poll(async () => (await geometry()).y)
      .toBeCloseTo(edge.y + 20, 0)
    await page.mouse.up()
    const released = await geometry()
    await page.mouse.move(width / 2, 500)
    await expect
      .poll(async () => (await geometry()).x)
      .toBeCloseTo(released.x, 0)

    await frame.focus()
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('ArrowLeft')
      await page.keyboard.press('ArrowUp')
    }
    await expect
      .poll(async () => {
        const bounds = await geometry()
        return (
          Math.abs(bounds.x - bounds.maxX) < 1 &&
          Math.abs(bounds.y - bounds.maxY) < 1 &&
          bounds.coversFrame
        )
      })
      .toBe(true)

    // Resize an already-panned image; its new bounds must remain filled.
    await page.setViewportSize({ width: 390, height: 600 })
    await expect.poll(async () => (await geometry()).coversFrame).toBe(true)
    await page.keyboard.press('-')
    await expect(frame).toHaveAttribute('aria-pressed', 'false')
    await expect.poll(async () => (await geometry()).x).toBe(0)
    await page.keyboard.press('+')
    await expect(frame).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.press('ArrowRight')
    await expect.poll(async () => (await geometry()).x).toBe(-50)
    await page.keyboard.press('Escape')
    await expect(frame).toHaveCount(0)
    expect(errors).toEqual([])
  })
}
