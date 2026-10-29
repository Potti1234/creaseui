import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { expect, test } from '@playwright/test'
import stylex from '@stylexjs/unplugin'
import {
  build,
  preview,
  type InlineConfig,
  type PluginOption,
  type PreviewServer,
} from 'vite'

import { stylexCompilerOptions } from '../stylex.config.js'

/* Shared app-shell fixture installed outside the docs shell: one
   renderer-neutral program, three styled kits, real production builds.
   Covers the tutorial app's non-collapsible sidebar findings (A0.6/A0.7). */
const RENDERERS = ['tailwind', 'stylex', 'pleat'] as const
type Renderer = (typeof RENDERERS)[number]

const pluginsFor = (renderer: Renderer): Array<PluginOption> => {
  if (renderer === 'tailwind') return [tailwindcss()]
  const noTailwind: PluginOption = {
    name: 'assert-no-tailwind-runtime',
    generateBundle() {
      expect(
        [...this.getModuleIds()].filter(id =>
          /node_modules[/\\](?:tailwind-merge|clsx|tailwindcss)[/\\]/u.test(id),
        ),
      ).toEqual([])
    },
  }
  return renderer === 'stylex'
    ? [stylex.vite(stylexCompilerOptions), noTailwind]
    : [noTailwind]
}

const openFixture = async (
  page: Parameters<Parameters<typeof test>[1]>[0]['page'],
  url: string,
) => {
  const errors: Array<string> = []
  page.on('pageerror', error => errors.push(error.message))
  await page.setViewportSize({ width: 900, height: 700 })
  await page.goto(url)
  await expect(page.locator('[data-slot="sidebar"]')).toBeVisible()
  return errors
}

test.describe('shared app-shell fixture', () => {
  const servers = new Map<Renderer, PreviewServer>()
  const outputs: Array<string> = []

  test.beforeAll(async () => {
    test.setTimeout(240_000)
    for (const renderer of RENDERERS) {
      const output = mkdtempSync(resolve(tmpdir(), 'crease-app-shell-'))
      outputs.push(output)
      const config: InlineConfig = {
        configFile: false,
        root: resolve('e2e/fixtures/app-shell', renderer),
        logLevel: 'error',
        plugins: pluginsFor(renderer),
        resolve: { alias: { '@': resolve('src') } },
        build: { outDir: output },
      }
      await build(config)
      servers.set(
        renderer,
        await preview({ ...config, preview: { host: '127.0.0.1', port: 0 } }),
      )
    }
  })

  test.afterAll(async () => {
    for (const server of servers.values())
      await new Promise<void>((done, fail) =>
        server.httpServer.close(error => (error ? fail(error) : done())),
      )
    for (const output of outputs)
      if (output.startsWith(resolve(tmpdir(), 'crease-app-shell-')))
        rmSync(output, { recursive: true, force: true })
  })

  for (const renderer of RENDERERS)
    test(`${renderer}: non-collapsible sidebar fills the page height`, async ({
      page,
    }) => {
      const errors = await openFixture(
        page,
        servers.get(renderer)!.resolvedUrls!.local[0]!,
      )
      const sidebarHeight = await page.evaluate(() =>
        Math.round(
          document
            .querySelector('[data-slot="sidebar"]')!
            .getBoundingClientRect().height,
        ),
      )
      expect(sidebarHeight).toBe(700)
      expect(errors).toEqual([])
    })

  for (const renderer of RENDERERS)
    test(`${renderer}: a sub-menu <button> fills the item like an <a>`, async ({
      page,
    }) => {
      await openFixture(page, servers.get(renderer)!.resolvedUrls!.local[0]!)
      const widths = await page.evaluate(() =>
        Object.fromEntries(
          [
            ...document.querySelectorAll(
              '[data-slot="sidebar-menu-sub-button"]',
            ),
          ].map(element => [
            element.tagName,
            element.getBoundingClientRect().width,
          ]),
        ),
      )
      expect(widths.BUTTON).toBeGreaterThan(0)
      expect(Math.abs(widths.BUTTON - widths.A)).toBeLessThanOrEqual(1)
    })

  for (const renderer of RENDERERS)
    test(`${renderer}: sub-menu entries are keyboard reachable`, async ({
      page,
    }) => {
      const errors = await openFixture(
        page,
        servers.get(renderer)!.resolvedUrls!.local[0]!,
      )
      // The Message-navigating sub-item renders a real <button>; Tab reaches it.
      await page.keyboard.press('Tab')
      await expect(
        page.locator('button[data-slot="sidebar-menu-sub-button"]'),
      ).toBeFocused()
      // Its badge is positioned inside the sub-item, right-aligned.
      const subItem = page.locator('[data-slot="sidebar-menu-sub-item"]', {
        has: page.locator('[data-slot="sidebar-menu-badge"]'),
      })
      const liBox = await subItem.boundingBox()
      const badgeBox = await subItem
        .locator('[data-slot="sidebar-menu-badge"]')
        .boundingBox()
      expect(badgeBox).not.toBeNull()
      expect(badgeBox!.y).toBeGreaterThanOrEqual(liBox!.y)
      expect(badgeBox!.y + badgeBox!.height).toBeLessThanOrEqual(
        liBox!.y + liBox!.height,
      )
      expect(badgeBox!.x + badgeBox!.width).toBeLessThanOrEqual(
        liBox!.x + liBox!.width,
      )
      expect(badgeBox!.x).toBeGreaterThan(liBox!.x + liBox!.width / 2)
      expect(errors).toEqual([])
    })

  for (const renderer of RENDERERS)
    test(`${renderer}: accent avatar fallback stays visible on the sidebar`, async ({
      page,
    }) => {
      const errors = await openFixture(
        page,
        servers.get(renderer)!.resolvedUrls!.local[0]!,
      )
      const accent = page.locator(
        '[data-slot="fixture-avatar-accent"] [data-slot="avatar-fallback"]',
      )
      const muted = page.locator(
        '[data-slot="fixture-avatar-muted"] [data-slot="avatar-fallback"]',
      )
      const accentBg = await accent.evaluate(
        el => getComputedStyle(el).backgroundColor,
      )
      const mutedBg = await muted.evaluate(
        el => getComputedStyle(el).backgroundColor,
      )
      // The accent tint is a real, non-transparent fill distinct from muted.
      expect(accentBg).not.toBe(mutedBg)
      expect(accentBg).not.toBe('rgba(0, 0, 0, 0)')
      expect(accentBg).not.toBe('transparent')
      const accentColor = await accent.evaluate(
        el => getComputedStyle(el).color,
      )
      const mutedColor = await muted.evaluate(el => getComputedStyle(el).color)
      expect(accentColor).not.toBe(mutedColor)
      expect(errors).toEqual([])
    })

  for (const renderer of RENDERERS)
    test(`${renderer}: sidebar inset shrinks below its content width`, async ({
      page,
    }) => {
      const errors = await openFixture(
        page,
        servers.get(renderer)!.resolvedUrls!.local[0]!,
      )
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
      expect(errors).toEqual([])
    })
})
