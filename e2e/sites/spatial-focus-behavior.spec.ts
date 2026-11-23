import { expect, test } from '@playwright/test'

test.describe('SpatialFocus docs example', () => {
  test('follows geometry, skips disabled cards, and preserves modified shortcuts', async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem(
        'foldkit-devtools',
        '{"isOpen":false,"isFlattened":false}',
      ),
    )
    await page.goto('/docs/components/grid#grid-spatial-focus')
    const demo = page.locator('[data-spatial-focus-demo]')
    await expect(demo).toBeVisible()
    const card = (key: string) =>
      demo.getByRole('button', { name: `Card ${key}`, exact: true })
    await expect(card('D')).toBeDisabled()
    await expect(demo.locator('button[tabindex="0"]')).toHaveCount(1)
    await demo.locator('#docs-grid-spatial-instructions').focus()
    await page.keyboard.press('Tab')
    await expect(card('A')).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(card('C')).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(card('B')).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await expect(card('E')).toBeFocused()
    await page.keyboard.press('ArrowUp')
    await expect(card('A')).toBeFocused()
    await page.keyboard.press('Control+ArrowRight')
    await expect(card('A')).toBeFocused()
    await page.keyboard.press('End')
    await expect(card('E')).toBeFocused()
    await page.keyboard.press('Home')
    await expect(card('A')).toBeFocused()
    await expect(demo.locator('button[tabindex="0"]')).toHaveCount(1)
  })
})
