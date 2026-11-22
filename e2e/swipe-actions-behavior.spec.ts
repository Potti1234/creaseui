import { expect, test } from '@playwright/test'
import { createServer, type ViteDevServer } from 'vite'

test.describe('Swipe actions docs example', () => {
  let server: ViteDevServer
  let url: string
  test.beforeAll(async () => {
    server = await createServer({
      configFile: false,
      logLevel: 'error',
      optimizeDeps: { entries: ['src/docs/examples/swipe-actions/index.html'] },
      server: { host: '127.0.0.1', port: 0, watch: null },
    })
    await server.listen()
    url = new URL(
      '/src/docs/examples/swipe-actions/',
      server.resolvedUrls?.local[0],
    ).href
  })
  test.afterAll(async () => {
    await server?.close()
  })

  test('preserves clicks on interactive row content', async ({ page }) => {
    await page.goto(url)
    const content = page.locator('[data-swipe-key="design"] .content')
    await content.evaluate(element => {
      const button = document.createElement('button')
      button.textContent = 'Read message'
      button.addEventListener('click', () =>
        button.setAttribute('data-clicked', 'true'),
      )
      element.append(button)
    })
    const button = content.getByRole('button', { name: 'Read message' })
    await button.click()
    await expect(button).toHaveAttribute('data-clicked', 'true')
  })

  test('reveals at half, focuses actions with arrows, closes with Escape, flicks and full-swipes to delete', async ({
    page,
  }) => {
    await page.goto(url)
    const row = page.locator('[data-swipe-key="design"]')
    const content = row.locator('.content')
    const endActions = row.locator('[data-side="end"]')
    await expect(endActions).toHaveAttribute('inert', '')
    await row.focus()
    await row.press('ArrowLeft')
    await expect(row).toHaveAttribute('data-swipe-open', 'end')
    await expect(endActions).not.toHaveAttribute('inert')
    await expect(row.getByRole('button', { name: 'Delete' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(row).toBeFocused()
    await expect(endActions).toHaveAttribute('inert', '')
    await expect(content).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
    const box = (await row.boundingBox())!
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    const device = await page.context().newCDPSession(page)
    const swipe = async (dx: number, duration: number, pause: number) => {
      const timestamp = Date.now() / 1000
      await device.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x,
        y,
        timestamp,
      })
      await device.send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x,
        y,
        button: 'left',
        buttons: 1,
        clickCount: 1,
        timestamp,
      })
      await device.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: x + dx,
        y,
        button: 'left',
        buttons: 1,
        timestamp: timestamp + duration,
      })
      await device.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: x + dx,
        y,
        button: 'left',
        buttons: 0,
        clickCount: 1,
        timestamp: timestamp + duration + pause,
      })
    }
    await swipe(-60, 0.2, 0.1)
    await expect(row).toHaveAttribute('data-swipe-open', 'end')
    await expect(content).toHaveCSS('transform', 'matrix(1, 0, 0, 1, -100, 0)')
    await expect(row.getByRole('button', { name: 'Delete' })).toBeVisible()
    await page.screenshot({
      path: '/home/ubuntu/swipe-demo.png',
      fullPage: true,
    })
    await row.focus()
    await row.press('ArrowRight')
    await expect(row.getByRole('button', { name: 'Delete' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(row).toBeFocused()
    await expect(row).not.toHaveAttribute('data-swipe-open')
    await swipe(20, 0.01, 0.001)
    await expect(row).toHaveAttribute('data-swipe-open', 'start')
    await row.press('Escape')
    await swipe(-box.width * 0.7, 0.2, 0.1)
    await expect(row).toHaveCount(0)
    await expect(page.locator('[aria-live]')).toHaveText('Message deleted.')
  })
})
