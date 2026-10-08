import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const clickSlot = async (page: Page, input: Locator, index: number) => {
  await input.scrollIntoViewIfNeeded()
  const slot = input
    .locator('..')
    .locator('[data-slot="input-otp-slot"]')
    .nth(index)
  const box = await slot.boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await expect(input).toBeFocused()
  await expect
    .poll(() =>
      input.evaluate(element => {
        const control = element as HTMLInputElement
        return [control.selectionStart, control.selectionEnd]
      }),
    )
    .toEqual([index, index + 1])
}

for (const width of [1280, 390]) {
  test(`filled OTP slots can be replaced consecutively at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/docs/components/input-otp')
    for (const [id, initial, keys, expected] of [
      ['otp-basic', '123456', '9870', '129870'],
      ['otp-separator', '123456', '9870', '129870'],
      ['otp-four-digits', '1234', '98', '1298'],
      ['otp-alphanumeric', 'ABC123', 'ZYX0', 'ABZYX0'],
    ]) {
      const input = page.locator(`#${id}`)
      const slots = input.locator('..').locator('[data-slot="input-otp-slot"]')
      await input.fill(initial!)
      await expect(slots.last()).toHaveText(initial!.at(-1)!)
      await clickSlot(page, input, 2)
      for (let offset = 0; offset < keys!.length; offset++) {
        await page.keyboard.type(keys![offset]!)
        await expect(input).toHaveValue(
          initial!.slice(0, 2) +
            keys!.slice(0, offset + 1) +
            initial!.slice(3 + offset),
        )
        const next = 3 + offset
        if (next < initial!.length) {
          await expect(slots.nth(next)).toHaveAttribute(
            'data-active',
            'selected',
          )
        }
      }
      await expect(input).toHaveValue(expected!)
      // An already active slot remains clickable and editable.
      await clickSlot(page, input, 2)
      await page.keyboard.type(initial![2]!)
      await clickSlot(page, input, 3)
      await page.keyboard.type(initial![3]!)
      await expect(input).toHaveValue(initial!.slice(0, 4) + expected!.slice(4))
    }
  })
}

test('OTP deletion, range replacement, and keyboard entry still work', async ({
  page,
}) => {
  await page.goto('/docs/components/input-otp')
  const input = page.locator('#otp-basic')
  const slots = input.locator('..').locator('[data-slot="input-otp-slot"]')
  await input.fill('123456')
  await expect(slots.last()).toHaveText('6')
  await clickSlot(page, input, 2)
  await page.keyboard.press('Backspace')
  await expect(input).toHaveValue('12456')
  await page.keyboard.type('9')
  await expect(input).toHaveValue('129456')
  await input.selectText()
  await page.keyboard.type('987654', { delay: 30 })
  await expect(input).toHaveValue('987654')
  await expect(slots.last()).toHaveText('4')
})
