import { chromium } from '@playwright/test'

const browser = await chromium.launch({ headless: true })
try {
  for (const [revision, basePort] of [
    ['main', 5273],
    ['branch', 4173],
  ]) {
    for (const [offset, renderer] of [
      'tailwind',
      'stylex',
      'pleat',
    ].entries()) {
      const page = await browser.newPage()
      await page.goto(
        `http://127.0.0.1:${basePort + offset}/docs/components/number-input`,
      )
      const input = page.locator('[data-slot="number-input-input"]').first()
      const increment = page
        .getByRole('button', { name: 'Increment Quantity', exact: true })
        .first()
      await increment.hover()
      const before = await input.inputValue()
      await page.mouse.down()
      await page.waitForTimeout(1000)
      const held = await input.inputValue()
      await page.mouse.up()
      await page.waitForTimeout(150)
      const after = await input.inputValue()
      console.log(
        `${revision} ${renderer}: before=${before} held=${held} after=${after}`,
      )
      await page.close()
    }
  }
} finally {
  await browser.close()
}
