import { readFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { build, preview, type InlineConfig, type PreviewServer } from 'vite'
import stylex from '@stylexjs/unplugin'

import { stylexCompilerOptions } from '../stylex.config.js'

// Build a real consumer with StyleX alone. The docs app's Tailwind and global
// selectors must never enter this fixture, even when CI serves the main build.
test.describe('StyleX without preflight', () => {
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
    output = mkdtempSync(resolve(tmpdir(), 'crease-stylex-preflight-'))
    const config: InlineConfig = {
      configFile: false as const,
      root: resolve('e2e/fixtures/stylex-preflight'),
      logLevel: 'error' as const,
      plugins: [
        stylex.vite(stylexCompilerOptions),
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
    if (output?.startsWith(resolve(tmpdir(), 'crease-stylex-preflight-'))) {
      rmSync(output, { recursive: true, force: true })
    }
  })

  const snapshot = (page: Page) =>
    page.locator('[data-slot="sidebar-wrapper"]').evaluate(root => {
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
        'list-style-type',
        'text-decoration-line',
        'opacity',
        'vertical-align',
      ]
      return [...root.querySelectorAll('[data-slot], [data-slot] *')]
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

  const expectIndependent = async (page: Page) => {
    // Moving off controls avoids a test-dependent hover style.
    await page.mouse.move(1200, 900)
    const screenshotWithout = await page.screenshot({ animations: 'disabled' })
    const without = await snapshot(page)
    await test.info().attach('without-preflight', {
      body: screenshotWithout,
      contentType: 'image/png',
    })
    const sheet = await page.addStyleTag({
      content: `@layer base { ${preflight} }`,
    })
    const screenshotWith = await page.screenshot({ animations: 'disabled' })
    await test.info().attach('with-preflight', {
      body: screenshotWith,
      contentType: 'image/png',
    })
    await expect.poll(() => snapshot(page)).toEqual(without)
    expect(
      screenshotWith.equals(screenshotWithout),
      'Preflight must not change the screenshot',
    ).toBe(true)
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
