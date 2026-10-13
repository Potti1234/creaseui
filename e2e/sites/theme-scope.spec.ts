import { expect, test } from '@playwright/test'

/* R1 regression: derived state colors (hover mixes) must resolve against the
   Create board's scoped palette, not the :root palette, in every renderer. */
for (const theme of ['Emerald', 'Blue'] as const) {
  test(`primary button hover keeps the scoped ${theme} palette`, async ({
    page,
  }) => {
    await page.goto('/create')
    await page.locator('#create-theme-picker-button').click()
    await page
      .locator('#create-theme-picker-panel button', {
        hasText: new RegExp(`^${theme}$`),
      })
      .click()
    const button = page
      .locator(
        '[data-crease-board-theme] [data-slot="button"], .create-board-theme [data-slot="button"]',
      )
      .filter({ hasText: 'Save Threshold' })
      .first()
    const rest = await button.evaluate(e => getComputedStyle(e).backgroundColor)
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
