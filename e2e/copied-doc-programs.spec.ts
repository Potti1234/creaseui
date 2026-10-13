import { execFileSync } from 'node:child_process'
import { readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import { build, preview, type PreviewServer } from 'vite'
import stylex from '@stylexjs/unplugin'

import { stylexCompilerOptions } from '../stylex.config.js'

// Copied StyleX/Pleat documentation programs must build through the real
// renderer transforms and survive startup + first render. Typechecking the
// source strings cannot catch execution-order errors such as reading
// `styles` before its declaration has been evaluated.
test.describe('Copied documentation programs', () => {
  test.describe.configure({ mode: 'serial' })
  const root = resolve('e2e/.generated/copied-programs')
  const output = resolve('e2e/.generated/copied-programs-dist')
  let server: PreviewServer
  let url: string
  let entries: Array<string> = []

  test.beforeAll(async () => {
    test.setTimeout(900_000)
    rmSync(root, { recursive: true, force: true })
    execFileSync(
      'npx',
      [
        'tsx',
        'e2e/fixtures/copied-programs/emit.ts',
        root,
        ...(process.env.COPIED_PROGRAMS ? [process.env.COPIED_PROGRAMS] : []),
      ],
      { stdio: 'inherit' },
    )
    entries = JSON.parse(readFileSync(resolve(root, 'entries.json'), 'utf8'))
    const config = {
      configFile: false as const,
      root,
      logLevel: 'error' as const,
      plugins: [stylex.vite(stylexCompilerOptions)],
      resolve: { alias: { '@': resolve('src') } },
      build: {
        outDir: output,
        emptyOutDir: true,
        rollupOptions: {
          input: Object.fromEntries(
            entries.map(name => [name, resolve(root, `${name}.html`)]),
          ),
        },
      },
    }
    await build(config)
    server = await preview({
      ...config,
      preview: { host: '127.0.0.1', port: 0 },
    })
    url = server.resolvedUrls!.local[0]!
  })

  test.afterAll(async () => {
    if (server) {
      await new Promise<void>((done, fail) =>
        server.httpServer.close(error => (error ? fail(error) : done())),
      )
    }
  })

  test('every program starts and renders its first view', async ({
    context,
  }) => {
    test.setTimeout(900_000)
    const failures: Array<string> = []
    const queue = [...entries]
    const visit = async () => {
      const page = await context.newPage()
      for (let name = queue.shift(); name; name = queue.shift()) {
        const errors: Array<string> = []
        const onError = (error: Error) => errors.push(error.message)
        page.on('pageerror', onError)
        await page.goto(`${url}${name}.html`)
        // Foldkit patches the container element itself, so look for any
        // rendered (non-script) body content rather than #root children.
        await page
          .waitForFunction(
            () =>
              [...document.body.children].some(
                element =>
                  element.tagName !== 'SCRIPT' &&
                  (element.childElementCount > 0 ||
                    (element.textContent ?? '').trim().length > 0),
              ),
            undefined,
            { timeout: 5_000 },
          )
          .catch(() => errors.push('root never rendered'))
        const crashed = await page
          .getByText(/Application Crash/i)
          .count()
          .catch(() => 0)
        if (crashed > 0) errors.push('Foldkit application crash page')
        page.off('pageerror', onError)
        if (errors.length > 0) failures.push(`${name}: ${errors.join(' | ')}`)
      }
      await page.close()
    }
    await Promise.all(Array.from({ length: 8 }, visit))
    expect(failures.sort()).toEqual([])
  })
})
