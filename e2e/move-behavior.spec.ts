import { expect, test } from '@playwright/test'
import { createServer, type ViteDevServer } from 'vite'

test.describe('Move docs example', () => {
  let server: ViteDevServer
  let url: string

  test.beforeAll(async () => {
    server = await createServer({
      configFile: false,
      logLevel: 'error',
      optimizeDeps: { entries: ['src/docs/examples/move/index.html'] },
      server: { host: '127.0.0.1', port: 0, watch: null },
    })
    await server.listen()
    url = new URL('/src/docs/examples/move/', server.resolvedUrls?.local[0])
      .href
  })

  test.afterAll(async () => {
    await server?.close()
  })

  test('keeps focus while Alt+arrow nudges, Shift increases the step, and a command moves to a point', async ({
    page,
  }) => {
    await page.goto(url)
    const a = page.getByRole('button', { name: 'Tile A', exact: true })
    const b = page.getByRole('button', { name: 'Tile B', exact: true })
    const announcement = page.locator('[aria-live="assertive"]')
    await a.press('ArrowRight')
    await expect(a).toHaveCSS('left', '20px')
    await a.press('Alt+ArrowRight')
    await expect(a).toBeFocused()
    await expect(a).toHaveCSS('left', '30px')
    await expect(b).toHaveCSS('left', '130px')
    await a.press('Alt+Shift+ArrowDown')
    await expect(announcement).toHaveText('2 items moved to 30, 50.')
    await expect(b).toHaveCSS('top', '120px')
    await page.getByRole('button', { name: 'Return tile A to start' }).click()
    await expect(a).toHaveCSS('left', '20px')
    await expect(announcement).toHaveText('Tile A moved to 20, 20.')
  })

  test('distinguishes clicks, previews and commits a drag beyond the surface, and cancels with Escape', async ({
    page,
  }) => {
    await page.goto(url)
    const a = page.getByRole('button', { name: 'Tile A', exact: true })
    const b = page.getByRole('button', { name: 'Tile B', exact: true })
    const announcement = page.locator('[aria-live="assertive"]')
    const start = await a.boundingBox()
    expect(start).not.toBeNull()
    const { x, y } = start!
    await page.mouse.move(x + 20, y + 20)
    await page.mouse.down()
    await page.mouse.move(x + 21, y + 21)
    await page.mouse.up()
    await expect(a).toHaveAttribute('aria-pressed', 'false')
    await a.click()
    await expect(a).toHaveAttribute('aria-pressed', 'true')

    await b.focus()
    await page.mouse.move(x + 20, y + 20)
    await page.mouse.down()
    await page.mouse.move(x + 111, y + 241)
    await expect(a).toHaveCSS('left', '20px')
    await expect(a).toHaveCSS('translate', '91px 221px')
    await expect(b).toHaveCSS('translate', '91px 221px')
    await expect(announcement).toBeEmpty()
    await page.mouse.up()
    await expect(a).toHaveCSS('translate', 'none')
    await expect(a).toHaveCSS('left', '110px')
    await expect(b).toHaveCSS('left', '200px')
    await expect(announcement).toHaveText('2 items moved to 110, 150.')
    await expect(a).toHaveAttribute('aria-pressed', 'true')

    const after = (await a.boundingBox())!
    const fromX = Math.round(after.x + after.width / 2)
    const fromY = Math.round(after.y + after.height / 2)
    await page.mouse.move(fromX, fromY)
    await page.mouse.down()
    await page.mouse.move(fromX + 30, fromY)
    await expect(a).toHaveCSS('translate', '30px')
    await page.keyboard.press('Escape')
    await expect(a).toHaveCSS('translate', 'none')
    await page.mouse.up()
    await expect(a).toHaveCSS('left', '110px')
    await expect(a).toHaveAttribute('aria-pressed', 'true')
    await expect(announcement).toHaveText('2 items moved to 110, 150.')
  })

  test('pointer cancellation discards a touch draft and allows another drag', async ({
    page,
  }) => {
    await page.goto(url)
    const device = await page.context().newCDPSession(page)
    await device.send('Emulation.setTouchEmulationEnabled', { enabled: true })
    const a = page.getByRole('button', { name: 'Tile A', exact: true })
    const start = (await a.boundingBox())!
    const point = { x: Math.round(start.x + 20), y: Math.round(start.y + 20) }
    const lift = { touchPoints: [] }
    const startAndMove = async () => {
      await device.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [point],
      })
      await device.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ ...point, x: point.x + 25 }],
      })
      await expect(a).toHaveCSS('translate', '25px')
    }
    await startAndMove()
    await device.send('Input.dispatchTouchEvent', {
      type: 'touchCancel',
      ...lift,
    })
    await expect(a).toHaveCSS('translate', 'none')
    await expect(a).toHaveCSS('left', '20px')
    await expect(page.locator('[aria-live="assertive"]')).toBeEmpty()

    await startAndMove()
    await device.send('Input.dispatchTouchEvent', { type: 'touchEnd', ...lift })
    await expect(a).toHaveCSS('translate', 'none')
    await expect(a).toHaveCSS('left', '50px')
    await expect(a).toHaveAttribute('aria-pressed', 'true')
  })
})
