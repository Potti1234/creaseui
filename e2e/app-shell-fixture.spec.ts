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
})
