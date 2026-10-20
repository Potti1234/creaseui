import { expect, test } from '@playwright/test'

import {
  DEFAULT_CONFIG,
  accentForTheme,
  encodePreset,
} from '../../src/demo/create-preset'

/* R1 regression: derived state colors (hover mixes) must resolve against the
   Create board's scoped palette, not the :root palette, in every renderer.
   The accent is applied through the Open Preset input since the accent is
   parametric now — a preset code sets hue/chroma/lightness exactly. */
for (const theme of ['emerald', 'blue'] as const) {
  test(`primary button hover keeps the scoped ${theme} palette`, async ({
    page,
  }) => {
    await page.goto('/create')
    await page.getByText('Open Preset', { exact: true }).click()
    await page.locator('#create-preset-input').fill(
      encodePreset({
        ...DEFAULT_CONFIG,
        ...accentForTheme(theme),
        hover: 'accent',
      }),
    )
    await page.getByRole('button', { name: 'Apply Preset' }).click()
    const button = page
      .locator(
        '[data-crease-board-theme] [data-slot="button"], .create-board-theme [data-slot="button"]',
      )
      .filter({ hasText: 'Save Threshold' })
      .first()
    const rest = await button.evaluate(e => getComputedStyle(e).backgroundColor)
    const restChroma = await button.evaluate(e => {
      const probe = document.createElement('div')
      probe.style.color = getComputedStyle(e).backgroundColor
      document.body.append(probe)
      const [r, g, b] = getComputedStyle(probe)
        .color.match(/[\d.-]+/g)!
        .map(Number)
      probe.remove()
      return Math.max(r!, g!, b!) - Math.min(r!, g!, b!)
    })
    expect(restChroma, `rest ${rest}`).toBeGreaterThan(0.02)
    await button.hover()
    await expect
      .poll(() => button.evaluate(e => getComputedStyle(e).backgroundColor))
      .not.toBe(rest)
    const hover = await button.evaluate(e => {
      const probe = document.createElement('div')
      probe.style.color = getComputedStyle(e).backgroundColor
      document.body.append(probe)
      const [r, g, b] = getComputedStyle(probe)
        .color.match(/[\d.-]+/g)!
        .map(Number)
      probe.remove()
      return { r, g, b }
    })
    // Neutral fallback is achromatic; a scoped accent hover stays chromatic.
    const chroma =
      Math.max(hover.r!, hover.g!, hover.b!) -
      Math.min(hover.r!, hover.g!, hover.b!)
    expect(chroma, JSON.stringify(hover)).toBeGreaterThan(0.02)
  })
}
