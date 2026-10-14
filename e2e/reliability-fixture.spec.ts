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
  groupStart: '#actions-text [role="group"] button:first-child',
  groupMiddle: '#actions-text [role="group"] button:nth-child(2)',
  groupEnd: '#actions-text [role="group"] button:last-child',
  heading: '#actions-text h2',
  badge: '#actions-text [data-slot="badge"]',
  alert: '#actions-text [data-slot="alert"]',
  card: '#surfaces-data [data-slot="card"]',
  cardTitle: '#surfaces-data [data-slot="card-title"]',
  tableHead: '#surfaces-data th',
  tableCell: '#surfaces-data td',
  tabsList: '#settings [data-slot="tabs-list"]',
  tabsTrigger: '#settings [data-slot="tabs-trigger"]',
  stat: '#dashboard [data-slot="stat"]',
  statValue: '#dashboard [data-slot="stat-value"]',
} as const

const SCOPED = {
  action: '#dark-scope [data-slot="button"]',
  panel: '[data-slot="popover-content"]',
} as const

const scopedColors = (page: Page) =>
  page.evaluate(selectors => {
    const read = (selector: string) => {
      const element = document.querySelector(selector)
      if (!element) return null
      const style = getComputedStyle(element)
      return {
        background: style.backgroundColor,
        color: style.color,
        radius: style.borderTopLeftRadius,
        shadow: style.boxShadow !== 'none',
      }
    }
    return { action: read(selectors.action), panel: read(selectors.panel) }
  }, SCOPED)

const cssVariable = (page: Page, name: string) =>
  page.evaluate(variable => {
    const probe = document.createElement('div')
    probe.style.backgroundColor = `var(${variable})`
    document
      .querySelector('#dark-scope [data-color-scheme="dark"]')!
      .append(probe)
    const value = getComputedStyle(probe).backgroundColor
    probe.remove()
    return value
  }, name)

const measure = (page: Page) =>
  page.evaluate(controls => {
    const read = (selector: string) => {
      const element = document.querySelector(selector)
      if (!element) return null
      const style = getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return {
        height: Math.round(box.height),
        // Rendered radius: CSS clamps corners to half the shorter side, so
        // 32px and 9999px pills draw the same shape.
        radius: [style.borderTopLeftRadius, style.borderTopRightRadius]
          .map(value =>
            Math.min(parseFloat(value), Math.min(box.width, box.height) / 2),
          )
          .map(value => `${String(Math.round(value * 100) / 100)}px`)
          .join(' '),
        weight: style.fontWeight,
        padding: `${style.paddingTop} ${style.paddingInlineStart}`,
        shadow: style.boxShadow !== 'none',
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
  const scoped = new Map<
    Renderer,
    Readonly<{
      rest: Awaited<ReturnType<typeof scopedColors>>
      hover: string
    }>
  >()

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

      const range = page.getByRole('group', { name: 'Calendar range' })
      await range.getByRole('button', { name: 'Month' }).click()
      await expect(
        page.locator('#actions-text [data-slot="badge"]'),
      ).toHaveText('Month')
      await expect(page.getByRole('status')).toHaveText('Showing Month')

      const invoices = page.locator('#surfaces-data table')
      await expect(
        page.getByRole('heading', { level: 3, name: 'Invoices' }),
      ).toBeVisible()
      await expect(invoices.getByRole('columnheader')).toHaveText([
        'Invoice',
        'Status',
        'Amount',
      ])
      await expect(invoices.locator('tbody').getByRole('row')).toHaveCount(3)

      const action = page.locator(SCOPED.action).first()
      const trigger = page.getByRole('button', { name: 'Scoped details' })
      await trigger.click()
      await expect(page.locator(SCOPED.panel)).toBeVisible()
      const rest = await scopedColors(page)
      expect(rest.action?.background).toBe(await cssVariable(page, '--primary'))
      expect(rest.panel?.background).toBe(await cssVariable(page, '--popover'))
      await page.keyboard.press('Escape')
      await expect(page.locator(SCOPED.panel)).toBeHidden()
      await expect(trigger).toBeFocused()
      await action.hover()
      // Sample the settled hover colour, not a mid-transition frame.
      await action.evaluate(element =>
        Promise.all(
          element.getAnimations().map(animation => animation.finished),
        ),
      )
      await expect
        .poll(() => action.evaluate(e => getComputedStyle(e).backgroundColor))
        .not.toBe(rest.action?.background)
      scoped.set(renderer, {
        rest,
        hover: await action.evaluate(e => getComputedStyle(e).backgroundColor),
      })
      expect(errors).toEqual([])
    })

  for (const renderer of RENDERERS)
    test(`${renderer}: date picker panel keeps the nested dark scope`, async ({
      page,
    }) => {
      const errors: Array<string> = []
      page.on('pageerror', error => errors.push(error.message))
      await page.goto(servers.get(renderer)!.resolvedUrls!.local[0]!)
      const trigger = page.locator('#dark-scope').getByRole('button', {
        name: /Scoped date/u,
      })
      await trigger.click()
      const panel = page.locator('[data-slot="popover-content"]:visible')
      await expect(panel).toHaveCount(1)
      await expect(panel.getByRole('grid')).toBeVisible()
      // In the themed subtree, not a body portal that loses the scope.
      // Tailwind paints the popover frame, StyleX/Pleat the calendar
      // (background role) over it; either way it is the dark palette.
      const darkSurfaces = [
        await cssVariable(page, '--popover'),
        await cssVariable(page, '--background'),
      ]
      const lightPopover = await page.evaluate(() =>
        getComputedStyle(document.body).getPropertyValue('--popover').trim(),
      )
      expect(darkSurfaces).not.toContain(lightPopover)
      expect(darkSurfaces).toContain(
        await panel.evaluate(element => {
          const grid = element.querySelector('[role="grid"]')
          return (
            [element, grid, grid?.parentElement]
              .map(node => node && getComputedStyle(node).backgroundColor)
              .find(color => color && color !== 'rgba(0, 0, 0, 0)') ?? ''
          )
        }),
      )
      await page.keyboard.press('Escape')
      await expect(panel).toHaveCount(0)
      await expect(trigger).toBeFocused()
      expect(errors).toEqual([])
    })

  for (const renderer of RENDERERS)
    test(`${renderer}: settings tabs and dashboard stats`, async ({ page }) => {
      const errors: Array<string> = []
      page.on('pageerror', error => errors.push(error.message))
      await page.setViewportSize({ width: 1000, height: 800 })
      await page.goto(servers.get(renderer)!.resolvedUrls!.local[0]!)
      const tablist = page.getByRole('tablist', { name: 'Settings sections' })
      const profile = tablist.getByRole('tab', { name: 'Profile' })
      const notifications = tablist.getByRole('tab', { name: 'Notifications' })
      await expect(profile).toHaveAttribute('aria-selected', 'true')
      await expect(page.getByText('Public profile details.')).toBeVisible()
      await profile.focus()
      await page.keyboard.press('ArrowRight')
      await expect(notifications).toBeFocused()
      await expect(notifications).toHaveAttribute('aria-selected', 'true')
      await expect(page.getByText('Public profile details.')).toHaveCount(0)
      const digest = page.getByRole('switch', { name: 'Weekly digest' })
      await digest.click()
      await expect(digest).toHaveAttribute('aria-checked', 'true')
      await expect(page.locator('#settings-status')).toHaveText('Digest on')

      const values = page.locator('#dashboard [data-slot="stat-value"]')
      await expect(values).toHaveCount(3)
      for (const numeric of await values.evaluateAll(elements =>
        elements.map(element => getComputedStyle(element).fontVariantNumeric),
      ))
        expect(numeric).toContain('tabular-nums')
      await page.setViewportSize({ width: 390, height: 844 })
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              document.documentElement.scrollWidth -
              document.documentElement.clientWidth,
          ),
        )
        .toBeLessThanOrEqual(0)
      expect(errors).toEqual([])
    })

  test('installed StyleX and Pleat controls match the Tailwind geometry', () => {
    const reference = measurements.get('tailwind')
    expect(reference).toBeDefined()
    for (const control of Object.values(reference!))
      expect(control).not.toBeNull()
    // Joined button-group edges: only the outer corners stay rounded.
    expect(reference!.groupMiddle!.radius).toBe('0px 0px')
    expect(reference!.groupStart!.radius).toMatch(/^[1-9][\d.]*px 0px$/u)
    expect(reference!.groupEnd!.radius).toMatch(/^0px [1-9][\d.]*px$/u)
    expect(measurements.get('stylex')).toEqual(reference)
    expect(measurements.get('pleat')).toEqual(reference)
  })

  test('scoped dark subtree resolves rest, hover and overlay roles alike', () => {
    const reference = scoped.get('tailwind')
    expect(reference).toBeDefined()
    expect(scoped.get('stylex')).toEqual(reference)
    expect(scoped.get('pleat')).toEqual(reference)
  })
})
