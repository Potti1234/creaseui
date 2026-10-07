import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

const catalog = JSON.parse(readFileSync('public/docs-index.json', 'utf8')) as {
  components: Array<{ slug: string; examples: string[] }>
}
const preflight = readFileSync('node_modules/tailwindcss/preflight.css', 'utf8')

// A fresh production page per component exercises every authored example,
// including compiler-only StyleX markers and module initialization.
for (const component of catalog.components) {
  test(`${component.slug}: isolated renderer and reset independence`, async ({
    page,
  }, info) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    // Keep remote fonts and avatar loads from changing layout between samples.
    await page.route('https://**', route => route.abort())
    if (info.project.name === 'stylex')
      await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') })
    await page.goto(`/docs/components/${component.slug}`)
    await expect(page.locator('main h1').first()).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute(
      'data-renderer',
      info.project.name,
    )
    await expect(
      page.getByRole('group', { name: 'Preview styling engine' }),
    ).toHaveCount(0)
    await expect(page.locator('#installation')).toBeVisible()
    expect(errors).toEqual([])

    if (info.project.name === 'stylex') {
      await page.addStyleTag({
        content:
          '*,*::before,*::after{animation:none!important;transition:none!important}',
      })
      const previews = page.locator('[data-example-preview]')
      expect(await previews.count()).toBeGreaterThan(0)
      const snapshot = () =>
        previews.evaluateAll(roots => {
          const properties = [
            'color',
            'background-color',
            'font-family',
            'font-size',
            'font-weight',
            'line-height',
            'margin-top',
            'margin-bottom',
            'padding-top',
            'padding-right',
            'padding-bottom',
            'padding-left',
            'border-top-width',
            'border-right-width',
            'border-bottom-width',
            'border-left-width',
            'display',
            'list-style-type',
            'text-decoration-line',
          ]
          return roots
            .flatMap(root => [...root.querySelectorAll('*')])
            .filter(
              element =>
                element.getClientRects().length > 0 &&
                getComputedStyle(element).visibility !== 'hidden',
            )
            .map(element => ({
              bounds: (() => {
                const { x, y, width, height } = element.getBoundingClientRect()
                return { x, y, width, height }
              })(),
              element: `${element.tagName}[${element.getAttribute('data-slot') ?? ''}]`,
              styles: Object.fromEntries(
                properties.map(property => [
                  property,
                  getComputedStyle(element).getPropertyValue(property),
                ]),
              ),
            }))
        })
      // Give image-error messages a render turn before comparing the same DOM.
      await expect
        .poll(() =>
          page
            .locator('img')
            .evaluateAll(images =>
              images.every(image => (image as HTMLImageElement).complete),
            ),
        )
        .toBe(true)
      // Freeze autoplay and JS animation frames while measuring CSS alone.
      await page.clock.pauseAt(new Date('2026-01-01T13:00:00Z'))
      await page.clock.runFor(50)
      for (const dark of [false, true]) {
        await page.evaluate(
          value => document.documentElement.classList.toggle('dark', value),
          dark,
        )
        const without = await snapshot()
        const sheet = await page.addStyleTag({
          content: `@layer base {${preflight}}`,
        })
        expect(await snapshot(), dark ? 'dark theme' : 'light theme').toEqual(
          without,
        )
        await sheet.evaluate(element => element.remove())
      }
    }
  })
}
