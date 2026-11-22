import { expect, test, type Page } from '@playwright/test'

import { selectStyle } from './create-helpers'

/* R3 environment contracts for the Create board: right-to-left layout,
   320px reflow (WCAG 1.4.10, equivalent to 400% zoom at 1280px), reduced
   motion and forced colors. Each must keep the board usable without page
   errors or horizontal document overflow. */

const collectErrors = (page: Page) => {
  const errors: Array<string> = []
  page.on('pageerror', error => errors.push(error.message))
  return errors
}

const documentOverflow = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  )

const openCreate = async (page: Page) => {
  await page.goto('/create')
  await expect(page.locator('[data-token]').first()).toBeVisible()
}

for (const width of [1440, 390])
  test(`rtl ${width}px mirrors the board without overflow`, async ({
    page,
  }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width, height: 900 })
    await openCreate(page)
    await page.evaluate(() => (document.documentElement.dir = 'rtl'))
    await selectStyle(page, 'lyra')
    await page.keyboard.press('Escape')

    const card = page.locator('[data-slot="card"]').first()
    await expect(card).toBeVisible()
    expect(
      await card.evaluate(element => getComputedStyle(element).direction),
    ).toBe('rtl')
    await expect.poll(() => documentOverflow(page)).toBe(0)
    expect(errors).toEqual([])
  })

test('320px reflow keeps the document free of horizontal overflow', async ({
  page,
}) => {
  const errors = collectErrors(page)
  await page.setViewportSize({ width: 320, height: 800 })
  await openCreate(page)
  await expect.poll(() => documentOverflow(page)).toBe(0)
  expect(await page.locator('[data-slot="card"]').count()).toBeGreaterThan(0)
  expect(errors).toEqual([])
})

test('reduced motion still opens and closes a picker', async ({
  page,
  browserName,
}) => {
  const errors = collectErrors(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openCreate(page)
  await page
    .locator('button', { hasText: /^Color$/ })
    .first()
    .click()
  const trigger = page.locator('#create-base-picker-button')
  await trigger.click()
  const popover = page.locator('#create-base-picker-panel')
  await expect(popover).toBeVisible()
  // Foldkit defers focus to a later frame, which can take several seconds on loaded WebKit runners.
  await expect(popover).toBeFocused(
    browserName === 'webkit' ? { timeout: 20_000 } : undefined,
  )
  await page.keyboard.press('Escape')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  if (browserName === 'webkit') {
    // The panel may unmount immediately or remain painted with data-closed.
    await expect(popover.and(page.locator(':not([data-closed])'))).toBeHidden()
  } else {
    await expect(popover).toBeHidden()
  }
  expect(errors).toEqual([])
})

test('forced colors keeps controls visibly bounded', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'forced-colors emulation is Chromium-only',
  )
  const errors = collectErrors(page)
  await page.emulateMedia({ forcedColors: 'active' })
  await openCreate(page)
  const bounded = await page.evaluate(() =>
    [
      ...document.querySelectorAll(
        '[data-slot="input"],[data-slot="select-trigger"]',
      ),
    ]
      .filter(element => element.getBoundingClientRect().height > 0)
      .map(element => {
        const style = getComputedStyle(element)
        return (
          parseFloat(style.borderTopWidth) > 0 || style.outlineStyle !== 'none'
        )
      }),
  )
  expect(bounded.length).toBeGreaterThan(0)
  expect(bounded.every(Boolean)).toBe(true)
  expect(errors).toEqual([])
})
