import { expect, test } from '@playwright/test'

test('number-input steppers repeat while held and stop on release', async ({
  page,
}, testInfo) => {
  await page.goto('/docs/components/number-input')
  const input = page.locator('[data-slot="number-input-input"]').first()
  const increment = page
    .getByRole('button', { name: 'Increment Quantity', exact: true })
    .first()
  await increment.scrollIntoViewIfNeeded()
  const before = Number.parseFloat(await input.inputValue())
  await increment.hover()
  await page.mouse.down()
  await page.waitForTimeout(1000)
  const during = Number.parseFloat(await input.inputValue())
  await page.mouse.up()
  const released = Number.parseFloat(await input.inputValue())
  await page.waitForTimeout(150)
  const after = Number.parseFloat(await input.inputValue())
  console.log(
    `${testInfo.project.name}: before=${before} held=${during} after=${after}`,
  )
  expect(during).toBeGreaterThan(before + 1)
  expect(after).toBe(released)
  await increment.click()
  await expect
    .poll(async () => Number.parseFloat(await input.inputValue()))
    .toBe(after + 1)

  await increment.click({ button: 'right' })
  expect(Number.parseFloat(await input.inputValue())).toBe(after + 1)

  await increment.focus()
  await page.keyboard.down('Space')
  await page.waitForTimeout(600)
  await page.keyboard.up('Space')
  await expect
    .poll(async () => Number.parseFloat(await input.inputValue()))
    .toBeGreaterThan(after + 2)
})
