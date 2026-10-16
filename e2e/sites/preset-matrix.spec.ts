import { expect, test } from '@playwright/test'

import { STYLES } from '../../src/demo/create-preset'
import { selectStyle } from './create-helpers'

/* R3 base matrix: every declared preset x light/dark x desktop/mobile, derived
   from the preset inventory so a new preset cannot miss the gate. Base-state
   only; state, overlay and RTL contracts live in their own specs. */
const MODES = ['light', 'dark'] as const
const VIEWPORTS = {
  desktop: { width: 1440, height: 1000 },
  mobile: { width: 390, height: 844 },
} as const

const BOARD_SLOTS = ['button', 'card', 'select-trigger', 'tabs-list'] as const

for (const style of STYLES)
  for (const mode of MODES)
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS))
      test(`${style} ${mode} ${viewportName} renders the Create board`, async ({
        page,
      }, testInfo) => {
        const errors: Array<string> = []
        page.on('pageerror', error => errors.push(error.message))
        await page.setViewportSize(viewport)
        await page.addInitScript(
          theme => localStorage.setItem('creaseui-theme', theme),
          mode,
        )
        await page.goto('/create')
        await expect(page.locator('html')).toHaveClass(
          mode === 'dark' ? /\bdark\b/ : /^(?![\s\S]*\bdark\b)/,
        )
        if (style !== 'nova') await selectStyle(page, style)
        await page.keyboard.press('Escape')

        const report = await page.evaluate(slots => {
          const root = document.documentElement
          const visible = (slot: string) =>
            [...document.querySelectorAll(`[data-slot="${slot}"]`)].filter(
              element => element.getBoundingClientRect().height > 0,
            ).length
          return {
            overflow: root.scrollWidth - root.clientWidth,
            counts: Object.fromEntries(
              slots.map(slot => [slot, visible(slot)]),
            ),
          }
        }, BOARD_SLOTS)

        expect(report.overflow, 'document overflows horizontally').toBe(0)
        for (const slot of BOARD_SLOTS)
          expect(report.counts[slot], `${slot} rendered`).toBeGreaterThan(0)
        expect(errors).toEqual([])

        await testInfo.attach(`${style}-${mode}-${viewportName}`, {
          body: await page.screenshot(),
          contentType: 'image/png',
        })
      })
