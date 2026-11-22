import { expect, test } from '@playwright/test'
import { createServer, type ViteDevServer } from 'vite'

test.describe('Viewport docs example', () => {
  let server: ViteDevServer
  let url: string

  test.beforeAll(async () => {
    server = await createServer({
      configFile: false,
      logLevel: 'error',
      optimizeDeps: { entries: ['src/docs/examples/viewport/index.html'] },
      server: { host: '127.0.0.1', port: 0, watch: null },
    })
    await server.listen()
    url = new URL('/src/docs/examples/viewport/', server.resolvedUrls?.local[0])
      .href
  })

  test.afterAll(async () => {
    await server?.close()
  })

  test('pans by drag and wheel, zooms at the pointer and by key, fits and resets', async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(url)
    const board = page.getByRole('group', { name: 'Pipeline canvas' })
    const world = board.locator('.world')
    const announcement = page.locator('[aria-live="polite"]')
    const box = (await board.boundingBox())!
    const transform = () => world.evaluate(el => el.style.transform)

    await page.mouse.move(box.x + 20, box.y + 200)
    await page.mouse.down()
    await page.mouse.move(box.x + 60, box.y + 180, { steps: 4 })
    await expect(board).toHaveAttribute('data-gesturing', '')
    await page.mouse.up()
    await expect(board).not.toHaveAttribute('data-gesturing', '')
    expect(await transform()).toBe('translate(40px, -20px) scale(1)')
    await expect(announcement).toHaveText('drag: zoom 100%')

    // Presses on items are left to the item.
    await page.getByText('Ingest').hover()
    await page.mouse.down()
    await page.mouse.move(box.x + 200, box.y + 200, { steps: 2 })
    await page.mouse.up()
    expect(await transform()).toBe('translate(40px, -20px) scale(1)')

    await page.mouse.move(box.x + 100, box.y + 100)
    await page.mouse.wheel(0, 30)
    await expect.poll(transform).toBe('translate(40px, -50px) scale(1)')
    await page.keyboard.down('Control')
    await page.mouse.wheel(0, -50)
    await page.keyboard.up('Control')
    await expect(announcement).toContainText('wheel: zoom 165%')

    // Pressing empty canvas focused the board, so zoom keys reach it.
    await expect(board).toBeFocused()
    await page.keyboard.press('0')
    await expect(announcement).toHaveText('Zoom 100%')
    await page.keyboard.press('+')
    await expect(announcement).toHaveText('Zoom 125%')

    await page.getByRole('button', { name: 'Fit all' }).click()
    await expect.poll(transform).toMatch(/scale\(0\.4\d*\)$/)
    await page.getByRole('button', { name: 'Reset view' }).click()
    await expect.poll(transform).toBe('translate(0px, 0px) scale(1)')
    expect(errors).toEqual([])
  })
})
