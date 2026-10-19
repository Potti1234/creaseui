import { expect, test } from '@playwright/test'

import { clippedText } from '../content-fit'

/* Review R10: the audit must catch content a card clips even when the page
   has no horizontal overflow, and leave intentional clipping alone. */
test('content-fit audit reports clipped text, not intentional truncation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 })
  const card = (style: string, attributes = '') =>
    `<div ${attributes} style="overflow:hidden;border:1px solid;padding:16px;min-width:0;${style}"><span style="white-space:nowrap;font-size:30px">$1,284,930 +12.4%</span></div>`
  await page.setContent(`
    <div id="fixed" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">${card('')}${card('')}${card('')}</div>
    <div id="truncated" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">${card('text-overflow:ellipsis')}${card('', 'data-clip-intended')}${card('overflow:auto')}</div>
    <div id="fixed-fit" style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px">${card('', '').replace('$1,284,930 +12.4%', '18')}${card('').replace('$1,284,930 +12.4%', '42')}</div>
    <div id="adaptive" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:16px">${card('')}${card('')}${card('')}</div>
  `)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  )
  expect(await clippedText(page.locator('#fixed'))).toHaveLength(3)
  expect(await clippedText(page.locator('#truncated'))).toEqual([])
  expect(await clippedText(page.locator('#fixed-fit'))).toEqual([])
  expect(await clippedText(page.locator('#adaptive'))).toEqual([])
})

for (const width of [390, 768, 1440])
  test(`Grid adaptive metric cards keep values and deltas readable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/docs/components/grid')
    const cards = page.locator('[data-slot="card"]:has([data-slot="stat"])')
    await expect(cards).toHaveCount(3)
    await cards
      .first()
      .evaluate(element =>
        element.scrollIntoView({ block: 'center', behavior: 'instant' }),
      )
    for (const card of await cards.all()) {
      await expect(card.locator('[data-slot="stat-value"]')).toBeVisible()
      expect(await clippedText(card)).toEqual([])
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
    expect(errors).toEqual([])
  })
