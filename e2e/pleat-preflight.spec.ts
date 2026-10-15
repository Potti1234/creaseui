import { readFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { build, preview, type InlineConfig, type PreviewServer } from 'vite'

// Build a real consumer with StyleX alone. The docs app's Tailwind and global
// selectors must never enter this fixture, even when CI serves the main build.
test.describe('Pleat without preflight', () => {
  test.describe.configure({ mode: 'serial' })
  let server: PreviewServer
  let output: string
  let url: string
  const preflight = readFileSync(
    'node_modules/tailwindcss/preflight.css',
    'utf8',
  )

  test.beforeAll(async () => {
    test.setTimeout(120_000)
    output = mkdtempSync(resolve(tmpdir(), 'crease-pleat-preflight-'))
    const config: InlineConfig = {
      configFile: false as const,
      root: resolve('e2e/fixtures/pleat-preflight'),
      logLevel: 'error' as const,
      plugins: [
        {
          name: 'assert-stylex-only-consumer',
          generateBundle() {
            expect(
              [...this.getModuleIds()].filter(id =>
                /node_modules[/\\](?:tailwind-merge|clsx)[/\\]/u.test(id),
              ),
            ).toEqual([])
          },
        },
      ],
      resolve: { alias: { '@': resolve('src') } },
      build: { outDir: output },
    }
    await build(config)
    server = await preview({
      ...config,
      preview: { host: '127.0.0.1', port: 0 },
    })
    url = server.resolvedUrls.local[0]!
  })

  test.afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve, reject) =>
        server.httpServer.close(error => (error ? reject(error) : resolve())),
      )
    }
    if (output?.startsWith(resolve(tmpdir(), 'crease-pleat-preflight-'))) {
      rmSync(output, { recursive: true, force: true })
    }
  })

  const snapshot = (page: Page) =>
    // Document-wide so portaled overlays (menus, dialogs) are compared too.
    page.evaluate(() => {
      const properties = [
        'width',
        'height',
        'display',
        'color',
        'background-color',
        'font-family',
        'font-size',
        'font-weight',
        'line-height',
        'letter-spacing',
        'margin-top',
        'margin-right',
        'margin-bottom',
        'margin-left',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
        'border-top-width',
        'border-right-width',
        'border-bottom-width',
        'border-left-width',
        'text-align',
        'white-space',
        'outline-style',
        'font-feature-settings',
        'font-variation-settings',
        'font-kerning',
        'font-style',
        'text-rendering',
        'text-wrap-mode',
        'list-style-type',
        'text-decoration-line',
        'opacity',
        'vertical-align',
      ]
      return [...document.querySelectorAll('[data-slot], [data-slot] *')]
        .filter(
          element =>
            element.getClientRects().length > 0 &&
            getComputedStyle(element).visibility !== 'hidden',
        )
        .map(element => ({
          element: `${element.tagName}[${element.getAttribute('data-slot') ?? ''}]`,
          styles: Object.fromEntries(
            properties.map(property => [
              property,
              getComputedStyle(element).getPropertyValue(property),
            ]),
          ),
        }))
    })

  /* Two identical consecutive frames, so a still-settling overlay (focus,
     scroll into view, late layout) is not compared mid-change. */
  const settledScreenshot = async (page: Page) => {
    let previous = await page.screenshot({ animations: 'disabled' })
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const next = await page.screenshot({ animations: 'disabled' })
      if (next.equals(previous)) return next
      previous = next
    }
    throw new Error('The page did not settle between screenshots')
  }

  // Names the changed region so a CI-only mismatch is diagnosable from the log.
  const describeDifference = (page: Page, before: Buffer, after: Buffer) =>
    page.evaluate(
      async ([before, after]) => {
        const pixels = async (base64: string) => {
          const response = await fetch(`data:image/png;base64,${base64}`)
          const bitmap = await createImageBitmap(await response.blob())
          const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
          const context = canvas.getContext('2d')!
          context.drawImage(bitmap, 0, 0)
          return context.getImageData(0, 0, bitmap.width, bitmap.height)
        }
        const [a, b] = await Promise.all([pixels(before!), pixels(after!)])
        let [left, top, right, bottom, count] = [Infinity, Infinity, -1, -1, 0]
        for (let index = 0; index < a.data.length; index += 4) {
          if (
            a.data[index] === b.data[index] &&
            a.data[index + 1] === b.data[index + 1] &&
            a.data[index + 2] === b.data[index + 2] &&
            a.data[index + 3] === b.data[index + 3]
          )
            continue
          const x = (index / 4) % a.width
          const y = Math.floor(index / 4 / a.width)
          count += 1
          left = Math.min(left, x)
          top = Math.min(top, y)
          right = Math.max(right, x)
          bottom = Math.max(bottom, y)
        }
        const element = document.elementFromPoint(
          (left + right) / 2,
          (top + bottom) / 2,
        )
        return {
          changedPixels: count,
          box: { left, top, right, bottom },
          element: element
            ? `${element.tagName}[${element.closest('[data-slot]')?.getAttribute('data-slot') ?? ''}] ${element.textContent?.trim().slice(0, 40) ?? ''}`
            : null,
        }
      },
      [before.toString('base64'), after.toString('base64')] as const,
    )

  const expectIndependent = async (page: Page) => {
    // Moving off controls avoids a test-dependent hover style.
    await page.mouse.move(1200, 900)
    const untouched = await settledScreenshot(page)
    /* Inserting any stylesheet repaints the page, and on CI's software
       rasterizer that repaint alone can move a glyph-edge pixel. An empty
       sheet is the control, so only preflight's own effect is compared. */
    const control = await page.addStyleTag({ content: '@layer base {}' })
    const screenshotWithout = await settledScreenshot(page)
    await control.evaluate(element => element.remove())
    if (!untouched.equals(screenshotWithout))
      console.log(
        'An empty stylesheet alone changed the screenshot:',
        JSON.stringify(
          await describeDifference(page, untouched, screenshotWithout),
        ),
      )
    const without = await snapshot(page)
    await test.info().attach('without-preflight', {
      body: screenshotWithout,
      contentType: 'image/png',
    })
    const sheet = await page.addStyleTag({
      content: `@layer base { ${preflight} }`,
    })
    const screenshotWith = await settledScreenshot(page)
    await test.info().attach('with-preflight', {
      body: screenshotWith,
      contentType: 'image/png',
    })
    await expect.poll(() => snapshot(page)).toEqual(without)
    const difference = screenshotWith.equals(screenshotWithout)
      ? null
      : await describeDifference(page, screenshotWithout, screenshotWith)
    expect(difference, 'Preflight must not change the screenshot').toBeNull()
    await sheet.evaluate(element => element.remove())
  }

  for (const dark of [false, true]) {
    test(`${dark ? 'dark' : 'light'} components and open overlays match with and without preflight`, async ({
      page,
    }) => {
      test.slow()
      await page.setViewportSize({ width: 1280, height: 1100 })
      await page.goto(url)
      await page.evaluate(
        dark => document.documentElement.classList.toggle('dark', dark),
        dark,
      )
      await expect(
        page.getByRole('button', { name: 'Open command dialog' }),
      ).toBeVisible()
      await expect(page.getByRole('list', { name: 'Items' })).toBeVisible()
      await expect(page.locator('[data-slot="button-icon"]').first()).toHaveCSS(
        'height',
        '14px',
      )
      await expect(page.locator('[data-slot="card"]')).toHaveCSS(
        'box-sizing',
        'border-box',
      )
      await expectIndependent(page)

      const desktop = page.locator('[data-slot="sidebar-container"]')
      await expect(
        desktop.getByRole('link', { name: 'Home default' }),
      ).toHaveAttribute('aria-current', 'page')
      await expect(
        desktop.getByRole('link', { name: 'Settings' }),
      ).toHaveAttribute('aria-current', 'page')
      await page.locator('[data-slot="sidebar-trigger"]').click()
      for (const size of ['default', 'sm', 'lg']) {
        await expect(
          desktop.getByRole('link', { name: `Home ${size}` }),
        ).toHaveCSS('width', '32px')
        await expect(
          desktop.getByRole('link', { name: `Home ${size}` }),
        ).toHaveCSS('height', '32px')
      }
      await expect(
        desktop.locator('[data-slot="sidebar-menu-label"]').first(),
      ).toHaveCSS('opacity', '0')
      await expect(
        desktop.locator('[data-slot="sidebar-group-label"]'),
      ).toHaveCSS('opacity', '0')
      await expect(
        desktop.locator('[data-slot="sidebar-menu-sub"]'),
      ).toBeHidden()
      await expectIndependent(page)

      await page.getByRole('button', { name: 'Open menu', exact: true }).click()
      await expect(page.getByRole('menu')).toBeVisible()
      await expectIndependent(page)
      await page.keyboard.press('Escape')

      await page.getByRole('button', { name: 'Open command dialog' }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.getByRole('combobox').fill('')
      await expect(page.getByRole('option', { name: 'Profile' })).toBeVisible()
      await expectIndependent(page)
      await page.getByRole('combobox').press('Escape')
      await expect(page.getByRole('option', { name: 'Profile' })).toBeHidden()
      // Like shadcn's CommandDialog, Escape in the command closes the dialog.
      await expect(page.locator('dialog')).toBeHidden()
      await page.getByRole('button', { name: 'Open command dialog' }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page
        .getByRole('button', { name: 'Close', exact: true })
        .press('Enter')
      await expect(page.locator('dialog')).toBeHidden()

      await page.setViewportSize({ width: 390, height: 844 })
      await expect(
        page
          .locator(
            '[data-slot="sidebar-mobile"] [data-slot="sidebar-menu-label"]',
          )
          .first(),
      ).toHaveCSS('opacity', '1')
      await expectIndependent(page)
    })
  }
})
