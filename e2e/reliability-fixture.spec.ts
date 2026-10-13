import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { expect, test, type Page } from '@playwright/test'
import stylex from '@stylexjs/unplugin'
import {
  build,
  preview,
  type InlineConfig,
  type PluginOption,
  type PreviewServer,
} from 'vite'

import { stylexCompilerOptions } from '../stylex.config.js'

/* R3 shared mixed-form fixture installed outside the docs shell: one
   renderer-neutral program, three styled kits, real production builds. */
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

const CONTROLS = {
  save: '#actions button:last-child',
  input: 'input#name',
  textarea: 'textarea#bio',
  select: 'select#plan',
} as const

const measure = (page: Page) =>
  page.evaluate(controls => {
    const read = (selector: string) => {
      const element = document.querySelector(selector)
      if (!element) return null
      const style = getComputedStyle(element)
      return {
        height: Math.round(element.getBoundingClientRect().height),
        radius: style.borderTopLeftRadius,
        border: style.borderTopWidth,
        fontSize: style.fontSize,
      }
    }
    return Object.fromEntries(
      Object.entries(controls).map(([name, selector]) => [
        name,
        read(selector),
      ]),
    )
  }, CONTROLS)

test.describe('shared mixed-form fixture', () => {
  test.describe.configure({ mode: 'serial' })
  const servers = new Map<Renderer, PreviewServer>()
  const outputs: Array<string> = []
  const measurements = new Map<Renderer, Awaited<ReturnType<typeof measure>>>()

  test.beforeAll(async () => {
    test.setTimeout(240_000)
    for (const renderer of RENDERERS) {
      const output = mkdtempSync(resolve(tmpdir(), 'crease-reliability-'))
      outputs.push(output)
      const config: InlineConfig = {
        configFile: false,
        root: resolve('e2e/fixtures/reliability', renderer),
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
      if (output.startsWith(resolve(tmpdir(), 'crease-reliability-')))
        rmSync(output, { recursive: true, force: true })
  })

  for (const renderer of RENDERERS)
    test(`${renderer}: validation, labels and submission`, async ({ page }) => {
      const errors: Array<string> = []
      page.on('pageerror', error => errors.push(error.message))
      await page.setViewportSize({ width: 1000, height: 800 })
      await page.goto(servers.get(renderer)!.resolvedUrls!.local[0]!)
      const name = page.getByLabel('Display name')
      const terms = page.getByRole('checkbox', { name: 'Accept terms' })
      const updates = page.getByRole('switch', { name: 'Product updates' })
      await expect(page.locator('#status')).toHaveText('Not saved')
      measurements.set(renderer, await measure(page))

      await page.getByRole('button', { name: 'Save' }).click()
      await expect(page.locator('#status')).toHaveText(
        'Fix the highlighted fields',
      )
      await expect(name).toHaveAttribute('aria-invalid', 'true')
      await expect(page.getByText('Enter a display name.')).toBeVisible()
      await expect(page.getByText('You must accept the terms.')).toBeVisible()

      await name.fill('Ada')
      await page.getByLabel('Plan').selectOption('pro')
      await page.getByLabel('Bio').fill('Mathematician')
      await terms.click()
      await expect(terms).toBeChecked()
      await updates.click()
      await expect(updates).toBeChecked()
      await page.getByRole('button', { name: 'Save' }).click()
      await expect(page.locator('#status')).toHaveText(
        'Saved Ada on pro with updates',
      )
      await expect(name).not.toHaveAttribute('aria-invalid', 'true')
      expect(errors).toEqual([])
    })

  test('installed StyleX and Pleat controls match the Tailwind geometry', () => {
    const reference = measurements.get('tailwind')
    expect(reference).toBeDefined()
    for (const control of Object.values(reference!))
      expect(control).not.toBeNull()
    expect(measurements.get('stylex')).toEqual(reference)
    expect(measurements.get('pleat')).toEqual(reference)
  })
})
