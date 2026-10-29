import { expect, test } from '@playwright/test'

/* A0.13 regression: the base theme declares Inter, so a fresh install must
   actually load it — not fall back to the system font. The docs site uses
   the same stack, so its computed font-family proves the family resolves
   (and document.fonts.check proves the face is loaded, not just named). */
for (const [renderer, port] of [
  ['tailwind', '4173'],
  ['stylex', '4174'],
] as const) {
  test(`body text resolves to Inter Variable on the ${renderer} site`, async ({
    page,
  }) => {
    await page.goto(`http://127.0.0.1:${port}/`)
    const family = await page.evaluate(
      () => getComputedStyle(document.body).fontFamily,
    )
    expect(family).toContain('Inter Variable')
    await expect
      .poll(() =>
        page.evaluate(() => document.fonts.check('1rem "Inter Variable"')),
      )
      .toBe(true)
  })
}
