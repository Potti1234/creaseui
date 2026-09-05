import { expect, test } from '@playwright/test'

test.describe('carousel', () => {
  test('renders disabled controls with icons and moves horizontally', async ({
    page,
  }) => {
    await page.goto('/docs/components/carousel')

    const example = page.locator('[data-slot="carousel"]').first()
    const previous = example.getByRole('button', { name: 'Previous slide' })
    const next = example.getByRole('button', { name: 'Next slide' })

    await expect(previous).toBeDisabled()
    await expect(previous.locator('svg')).toBeVisible()
    await expect(previous.locator('svg path')).toHaveCount(2)
    await expect(next.locator('svg')).toBeVisible()

    await next.click()
    await expect(previous).toBeEnabled()
    await expect(example.getByRole('group', { name: '2 of 3' })).toBeInViewport()

    const viewport = example.locator('[data-slot="carousel-content"]')
    await viewport.focus()
    await page.keyboard.press('End')
    await expect(example.getByRole('group', { name: '3 of 3' })).toBeInViewport()
    await expect(next).toBeDisabled()
    await page.keyboard.press('Home')
    await expect(example.getByRole('group', { name: '1 of 3' })).toBeInViewport()
  })

  test('lays out and moves the vertical example on the y axis', async ({
    page,
  }, testInfo) => {
    await page.goto('/docs/components/carousel')

    const example = page.locator('#two-at-a-time [data-slot="carousel"]')
    const viewport = example.locator('[data-slot="carousel-content"]')
    const container = viewport.locator(':scope > div')
    const next = example.getByRole('button', { name: 'Next slide' })

    await example.scrollIntoViewIfNeeded()
    await expect(viewport).toHaveCSS('overflow-x', 'hidden')
    await expect(viewport).toHaveCSS('overflow-y', 'hidden')
    await expect(next.locator('svg path')).toHaveCount(2)

    const before = await container.evaluate(
      element => getComputedStyle(element).transform,
    )
    await expect(viewport).toContainText('1')
    await next.click()
    await expect
      .poll(() =>
        container.evaluate(element => getComputedStyle(element).transform),
      )
      .not.toBe(before)
    await expect
      .poll(() =>
        viewport.evaluate(element => {
          const box = element.getBoundingClientRect()
          return document
            .elementFromPoint(
              box.left + box.width / 2,
              box.top + box.height / 2,
            )
            ?.textContent?.trim()
        }),
      )
      .toBe('2')

    await testInfo.attach('carousel-vertical', {
      body: await example.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
  })

  test('moves through a native touch gesture on mobile', { tag: '@mobile' }, async ({ page }) => {
    await page.goto('/docs/components/carousel')
    const example = page.locator('#single-slide')
    const viewport = example.locator('[data-slot="carousel-content"]')
    await viewport.scrollIntoViewIfNeeded()
    const box = await viewport.boundingBox()
    if (box === null) throw new Error('Carousel viewport has no layout box')
    const session = await page.context().newCDPSession(page)
    const y = box.y + box.height / 2
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width * 0.8, y }] })
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: box.x + box.width * 0.2, y }] })
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect(example).toContainText('Slide 2 of 3')
  })
})
