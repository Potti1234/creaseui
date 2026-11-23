import { expect, test, type Page } from '@playwright/test'

const renderers = [
  ['tailwind', 4173],
  ['stylex', 4174],
  ['pleat', 4175],
] as const

const card = (page: Page, title: string) =>
  page.locator('[data-transfer-key]', { hasText: title })
const lane = (page: Page, id: string) =>
  page.locator(`[data-transfer-list="${id}"]`)

for (const [renderer, port] of renderers) {
  test.describe(`${renderer} kanban Transfer`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `http://127.0.0.1:${String(port)}/blocks/preview/${renderer}--creaseui-kanban-board`,
      )
      await expect(lane(page, 'lane-backlog')).toBeVisible()
    })

    test('moves a card across lanes with the keyboard, skipping the full lane', async ({
      page,
    }) => {
      const announcement = page.locator('[aria-live="assertive"]')
      const usage = card(page, 'Usage analytics for admin roles')
      await usage.focus()
      await page.keyboard.press('Space')
      await expect(announcement).toContainText(
        'Picked up Usage analytics for admin roles, Backlog, position 1 of 3.',
      )
      await page.keyboard.press('ArrowRight')
      await expect(announcement).toHaveText(
        'Usage analytics for admin roles, Review, position 1 of 3.',
      )
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Space')
      await expect(announcement).toHaveText(
        'Dropped Usage analytics for admin roles in Review, position 2 of 3.',
      )
      await expect(
        lane(page, 'lane-review').locator('[data-transfer-key]').nth(1),
      ).toContainText('Usage analytics for admin roles')
      await expect(lane(page, 'lane-backlog')).toContainText('2')
      await expect(usage).toBeFocused()

      const webhook = card(page, 'Webhook replay tooling')
      await webhook.focus()
      await page.keyboard.press('Enter')
      await page.keyboard.press('ArrowLeft')
      await expect(lane(page, 'lane-review')).toContainText(
        'Webhook replay tooling',
      )
      await page.keyboard.press('Escape')
      await expect(announcement).toHaveText(
        'Moved Webhook replay tooling back to Done, position 2 of 3.',
      )
      await expect(lane(page, 'lane-done')).toContainText(
        'Webhook replay tooling',
      )
    })

    test('drags a card into another lane with the pointer', async ({
      page,
    }) => {
      const shortcuts = card(page, 'Keyboard shortcuts for the board')
      const from = await shortcuts.boundingBox()
      const target = await card(page, 'Webhook replay tooling').boundingBox()
      if (from === null || target === null) throw new Error('missing boxes')
      await page.mouse.move(from.x + 20, from.y + 20)
      await page.mouse.down()
      await page.mouse.move(from.x + 40, from.y + 40, { steps: 4 })
      await page.mouse.move(target.x + 20, target.y + 10, { steps: 12 })
      await expect(page.locator('[data-transfer-dragging]')).toHaveCount(1)
      await page.mouse.up()
      await expect(
        lane(page, 'lane-done').locator('[data-transfer-key]').nth(1),
      ).toContainText('Keyboard shortcuts for the board')
      await expect(lane(page, 'lane-in-progress')).toContainText('2 / 3')
      await expect(page.locator('[data-transfer-dragging]')).toHaveCount(0)
    })
  })
}
