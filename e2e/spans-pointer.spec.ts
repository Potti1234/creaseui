import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

import { expect, test } from '@playwright/test'
import { build, preview, type PreviewServer } from 'vite'

let output: string | undefined
let server: PreviewServer | undefined

test.beforeAll(async () => {
  output = mkdtempSync(resolve(tmpdir(), 'crease-spans-'))
  const config = {
    configFile: false,
    publicDir: false,
    logLevel: 'error',
  } as const
  await build({
    ...config,
    build: {
      outDir: output,
      rollupOptions: { input: 'src/docs/spans-demo.html' },
    },
  })
  server = await preview({
    ...config,
    build: { outDir: output },
    preview: { host: '127.0.0.1', port: 0 },
  })
})

test.afterAll(async () => {
  if (server)
    await new Promise<void>((done, fail) =>
      server.httpServer.close(error => (error ? fail(error) : done())),
    )
  if (output) rmSync(output, { force: true, recursive: true })
})

test('Spans previews drawing and moving, cancels a pointer and restores keyboard focus', async ({
  page,
}) => {
  const url = server?.resolvedUrls?.local[0]
  if (!url) throw new Error('Spans demo preview did not start')
  await page.goto(new URL('src/docs/spans-demo.html', url).href)

  const studio = page.locator('[data-span-track="Studio"]')
  const workshop = page.locator('[data-span-track="Workshop"]')
  const studioBox = await studio.boundingBox()
  const workshopBox = await workshop.boundingBox()
  if (!studioBox || !workshopBox)
    throw new Error('Spans demo tracks did not render')
  const x = (fraction: number) => studioBox.x + studioBox.width * fraction
  const studioY = studioBox.y + studioBox.height / 2
  const workshopY = workshopBox.y + workshopBox.height / 2
  const status = page.getByRole('status')

  await page.mouse.move(x(0.315), studioY)
  await page.mouse.down()
  await page.mouse.move(x(0.47), studioY)
  await expect(studio.locator('[data-drawing]')).toHaveAccessibleName(
    'New booking, Studio, 11:30 to 13:00',
  )
  await expect(status).toHaveText('No changes yet.')
  await page.mouse.up()
  await expect(status).toHaveText('Added New booking, Studio, 11:30 to 13:00.')
  await expect(studio.locator('[data-drawing]')).toHaveCount(0)

  const design = page.locator('#booking-1')
  await page.mouse.move(x(0.15), studioY)
  await page.mouse.down()
  await page.mouse.move(x(0.15), workshopY)
  await expect(workshop.locator('#booking-1[data-dragging]')).toBeVisible()
  await expect(status).toContainText('Added New booking')
  await page.mouse.up()
  await expect(status).toHaveText('Design review, Workshop, 9:30 to 11:00.')

  await design.evaluate(button => {
    button.addEventListener(
      'pointerdown',
      event => {
        button.setAttribute('data-test-pointer-id', String(event.pointerId))
      },
      { once: true },
    )
  })
  await page.mouse.move(x(0.15), workshopY)
  await page.mouse.down()
  const pointerId = Number(await design.getAttribute('data-test-pointer-id'))
  expect(pointerId).toBeGreaterThan(0)
  await page.mouse.move(x(0.08), workshopY)
  await expect(
    workshop.locator('#booking-1[data-dragging]'),
  ).toHaveAccessibleName('Design review, Workshop, 9:00 to 10:30')
  await design.dispatchEvent('pointercancel', { pointerId, bubbles: true })
  await page.mouse.up()
  await expect(status).toHaveText(
    'Put back Design review, Workshop, 9:30 to 11:00.',
  )
  await expect(design).toHaveAccessibleName(
    'Design review, Workshop, 9:30 to 11:00',
  )
  await expect(workshop.locator('[data-dragging]')).toHaveCount(0)

  await design.focus()
  await page.keyboard.press('ArrowUp')
  await expect(studio.locator('#booking-1')).toBeFocused()
  await expect(status).toHaveText('Design review, Studio, 9:30 to 11:00.')
})
