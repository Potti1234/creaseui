import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const settled = async (popup: Locator) => {
  await expect(popup).toBeVisible()
  await expect(popup).not.toHaveAttribute('data-transition')
  await expect
    .poll(() => popup.evaluate(element => element.getAnimations().length))
    .toBe(0)
}

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]) {
  for (const direction of ['down', 'up', 'left', 'right']) {
    test(`nested ${direction} drawers stay aligned at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))
      await page.goto('/docs/components/drawer')
      await page
        .locator('#nested')
        .getByRole('button', { name: direction, exact: true })
        .click()
      const popups = page.locator('[data-slot="drawer-popup"]')
      const parent = popups.nth(0)
      await settled(parent)
      const original = await parent.boundingBox()
      expect(original).not.toBeNull()
      await expect(
        parent.locator('[data-slot="drawer-swipe-handle"]'),
      ).toHaveCount(1)

      for (let cycle = 0; cycle < 2; cycle++) {
        await parent
          .getByRole('button', { name: 'Open nested drawer', exact: true })
          .click()
        const child = popups.nth(1)
        await settled(child)
        await child
          .getByRole('button', { name: 'Open third drawer', exact: true })
          .click()
        const front = popups.nth(2)
        await settled(front)
        await settled(parent)
        await settled(child)
        await expect
          .poll(() =>
            parent.evaluate(element =>
              element.style.getPropertyValue('--nested-drawers'),
            ),
          )
          .toBe('2')
        await expect
          .poll(() =>
            child.evaluate(element =>
              element.style.getPropertyValue('--nested-drawers'),
            ),
          )
          .toBe('1')

        const frontBox = await front.boundingBox()
        expect(frontBox).not.toBeNull()
        expect(Math.abs(frontBox!.x - original!.x)).toBeLessThan(1)
        expect(Math.abs(frontBox!.width - original!.width)).toBeLessThan(1)
        for (const popup of [parent, child, front]) {
          const bounds = await popup.boundingBox()
          expect(bounds!.x).toBeGreaterThanOrEqual(-1)
          expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(
            viewport.width + 1,
          )
          const contained = await popup
            .locator('[data-slot="drawer-content"]')
            .evaluate(element => element.scrollWidth <= element.clientWidth)
          expect(contained).toBe(true)
          if (direction === 'down' || direction === 'up') {
            expect(
              Math.abs(bounds!.x + bounds!.width / 2 - viewport.width / 2),
            ).toBeLessThan(1)
          }
        }

        // Outside clicks dismiss only the frontmost drawer.
        await page.mouse.click(
          direction === 'left' ? viewport.width - 4 : 4,
          direction === 'up' ? viewport.height - 4 : 4,
        )
        await expect(popups).toHaveCount(2)
        await settled(child)
        await page.keyboard.press('Escape')
        await expect(popups).toHaveCount(1)
        await settled(parent)
        const restored = await parent.boundingBox()
        expect(Math.abs(restored!.x - original!.x)).toBeLessThan(1)
        expect(Math.abs(restored!.width - original!.width)).toBeLessThan(1)
      }
      await parent.getByRole('button', { name: 'Close', exact: true }).click()
      await expect(popups).toHaveCount(0)
      expect(errors).toEqual([])
    })
  }
}

test('drawer honors reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/docs/components/drawer')
  await page
    .locator('#nested')
    .getByRole('button', { name: 'down', exact: true })
    .click()
  const popup = page.locator('[data-slot="drawer-popup"]')
  await settled(popup)
  expect(
    await popup.evaluate(
      element => getComputedStyle(element).transitionProperty,
    ),
  ).toBe('none')
  await page.keyboard.press('Escape')
  await expect(popup).toHaveCount(0)
})

const dragHandle = async (page: Page, popup: Locator, deltaY: number) => {
  const handle = popup.locator('[data-slot="drawer-swipe-handle"]')
  const box = await handle.boundingBox()
  expect(box).not.toBeNull()
  const x = box!.x + box!.width / 2
  const y = box!.y + box!.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await expect(popup).toHaveAttribute('data-swiping')
  for (let step = 1; step <= 10; step++) {
    await page.mouse.move(x, y + (deltaY * step) / 10)
    // A slow drag verifies distance-based snapping rather than a fast flick.
    await page.waitForTimeout(35)
  }
  await page.waitForTimeout(120)
  await page.mouse.up()
}

test('snap points have a visible handle and can be dragged to expand, collapse, and dismiss', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/docs/components/drawer')
  await page
    .getByRole('button', { name: 'Open Snap Drawer', exact: true })
    .click()
  const popup = page.locator('[data-slot="drawer-popup"]')
  await settled(popup)
  const handle = popup.locator('[data-slot="drawer-swipe-handle"]')
  const pill = await handle.evaluate(element => {
    const style = getComputedStyle(element, '::after')
    return {
      content: style.content,
      width: parseFloat(style.width),
      height: parseFloat(style.height),
      background: style.backgroundColor,
    }
  })
  expect(pill.content).not.toBe('none')
  expect(pill.width).toBeGreaterThan(0)
  expect(pill.height).toBeGreaterThan(0)
  expect(pill.background).not.toBe('rgba(0, 0, 0, 0)')
  const compact = await popup.boundingBox()
  await dragHandle(page, popup, -300)
  await settled(popup)
  const expanded = await popup.boundingBox()
  expect(expanded!.y).toBeLessThan(compact!.y - 200)
  await expect(popup).toHaveAttribute('data-expanded')
  await dragHandle(page, popup, 300)
  await settled(popup)
  expect(Math.abs((await popup.boundingBox())!.y - compact!.y)).toBeLessThan(1)
  await dragHandle(page, popup, 380)
  await expect(popup).toHaveCount(0)
})
