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

/* Review F8: every clipping ancestor counts, not only the nearest one. */
test('content-fit audit checks outer clipping behind a box that fits', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 })
  const value =
    '<span style="white-space:nowrap;font-size:24px">$1,284,930 +12.4%</span>'
  await page.setContent(`
    <div id="control" style="width:100px;overflow:hidden">${value}</div>
    <div id="nested" style="width:100px;overflow:hidden"><div style="width:400px;overflow:hidden">${value}</div></div>
    <div id="nested-fit" style="width:300px;overflow:hidden"><div style="width:400px;overflow:hidden">${value}</div></div>
    <div id="scroll-inside" style="width:300px;overflow:hidden"><div style="width:100px;overflow:auto">${value}</div></div>
    <div id="scroll-outside" style="width:100px;overflow:hidden"><div style="width:400px;overflow:auto">${value}</div></div>
    <div id="ellipsis-outside" style="width:100px;overflow:hidden"><div style="width:400px;overflow:hidden;text-overflow:ellipsis">${value}</div></div>
    <div id="intended-inside" style="width:300px;overflow:hidden"><div data-clip-intended style="width:100px;overflow:hidden">${value}</div></div>
    <div id="sr-only" style="width:100px;overflow:hidden"><span style="position:absolute;width:1px;height:1px;overflow:hidden;white-space:nowrap">$1,284,930 +12.4%</span></div>
  `)
  const lost = async (id: string) =>
    (await clippedText(page.locator(`#${id}`))).map(found => found.overflow)
  expect(await lost('control')).toHaveLength(1)
  expect(await lost('nested')).toEqual(await lost('control'))
  for (const id of [
    'nested-fit',
    'scroll-inside',
    'intended-inside',
    'sr-only',
  ])
    expect(await lost(id), id).toEqual([])
  /* An intentional region inside a clipper that cuts the region itself. */
  expect(await lost('scroll-outside')).toHaveLength(1)
  expect(await lost('ellipsis-outside')).toHaveLength(1)
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
