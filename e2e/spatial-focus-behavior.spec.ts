import { expect, test } from '@playwright/test'
import { createServer, type ViteDevServer } from 'vite'

test.describe('SpatialFocus docs example', () => {
  let server: ViteDevServer
  let url: string

  test.beforeAll(async () => {
    server = await createServer({
      configFile: false,
      logLevel: 'error',
      optimizeDeps: { entries: ['src/docs/examples/spatial-focus/index.html'] },
      server: { host: '127.0.0.1', port: 0, watch: null },
    })
    await server.listen()
    url = new URL(
      '/src/docs/examples/spatial-focus/',
      server.resolvedUrls?.local[0],
    ).href
  })

  test.afterAll(async () => {
    await server?.close()
  })

  test('follows geometry, skips disabled cards, and preserves modified shortcuts', async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem(
        'foldkit-devtools',
        '{"isOpen":false,"isFlattened":false}',
      ),
    )
    await page.goto(url)
    const card = (key: string) =>
      page.getByRole('button', { name: `Card ${key}`, exact: false })
    await expect(card('D')).toBeDisabled()
    await expect(page.locator('button[tabindex="0"]')).toHaveCount(1)
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
    await expect(page.locator('button[tabindex="0"]')).toHaveCount(1)
  })
})
