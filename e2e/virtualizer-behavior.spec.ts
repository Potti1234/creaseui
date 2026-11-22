import { expect, test } from '@playwright/test'
import { createServer, type ViteDevServer } from 'vite'

test.describe('Virtualizer docs example', () => {
  let server: ViteDevServer
  let url: string
  test.beforeAll(async () => {
    server = await createServer({
      configFile: false,
      logLevel: 'error',
      optimizeDeps: { entries: ['src/docs/examples/virtualizer/index.html'] },
      server: { host: '127.0.0.1', port: 0, watch: null },
    })
    await server.listen()
    url = new URL(
      '/src/docs/examples/virtualizer/',
      server.resolvedUrls?.local[0],
    ).href
  })
  test.afterAll(async () => {
    await server?.close()
  })
  test('centers a row, bounds rendering, loads more near the end and returns to top', async ({
    page,
  }) => {
    await page.goto(url)
    await expect(page.locator('#rendered-count')).toHaveText(
      'Rendered 12 of 10000 rows',
    )
    await page.getByRole('button', { name: 'Center 50' }).click()
    const row = page.getByRole('listitem').filter({ hasText: /^Row 50$/ })
    await expect(row).toBeVisible()
    await expect(row).toHaveAttribute('aria-posinset', '50')
    await expect(row).toHaveAttribute('aria-setsize', '10000')
    await expect
      .poll(() =>
        page.locator('#virtualizer-demo').evaluate(el => el.scrollTop),
      )
      .toBe(1424)
    await page.screenshot({ path: 'test-results/virtualizer-center-50.png' })
    await page.getByRole('button', { name: 'Last', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Load more' })).toBeVisible()
    await page.getByRole('button', { name: 'Load more' }).click()
    await expect(page.locator('#rendered-count')).toContainText('of 11000 rows')
    await expect(page.getByRole('button', { name: 'Load more' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Top', exact: true }).click()
    await expect
      .poll(() =>
        page.locator('#virtualizer-demo').evaluate(el => el.scrollTop),
      )
      .toBe(0)
    await expect(page.getByRole('listitem')).toHaveCount(12)
    await expect(page.getByRole('listitem').first()).toHaveText('Row 1')
  })
})
