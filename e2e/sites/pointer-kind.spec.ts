import { devices, expect, test } from '@playwright/test'

for (const mobile of [false, true]) {
  test(`pointer capabilities follow ${mobile ? 'touch' : 'desktop'} media features`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      ...(mobile ? devices['iPhone 13'] : devices['Desktop Chrome']),
      baseURL,
    })
    await context.addInitScript(() => {
      localStorage.setItem(
        'foldkit-devtools',
        JSON.stringify({ isOpen: false, isFlattened: false }),
      )
      localStorage.setItem('creaseui-theme', 'light')
    })
    const page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/docs/components/pointer-kind')
    const demo = page.locator('[data-pointer-kind-demo]').first()
    for (const feature of ['pointer', 'anyPointer']) {
      await expect(
        demo.locator(`[data-pointer-feature="${feature}"]`),
      ).toHaveText(mobile ? 'coarse' : 'fine')
    }
    for (const feature of ['hover', 'anyHover']) {
      await expect(
        demo.locator(`[data-pointer-feature="${feature}"]`),
      ).toHaveText(mobile ? 'none' : 'hover')
    }
    await expect(demo.locator('[data-pointer-policy]')).toHaveText(
      mobile ? 'Tap to open' : 'Hover to open',
    )
    expect(errors).toEqual([])
    await context.close()
  })
}
