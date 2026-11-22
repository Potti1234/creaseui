import { expect, test, type Locator, type Page } from '@playwright/test'

const openWheel = async (page: Page) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.addInitScript(() => {
    localStorage.setItem('foldkit-devtools', JSON.stringify({ isOpen: false }))
  })
  await page.goto('/docs/components/time-input#time-wheels')
  const hours = page.getByRole('listbox', { name: 'Hours', exact: true })
  await hours.scrollIntoViewIfNeeded()
  await expect(hours.getByRole('option', { selected: true })).toHaveText('09')
  await expectCentered(hours)
  return hours
}

const expectCentered = async (wheel: Locator) => {
  await expect
    .poll(() =>
      wheel.evaluate(list => {
        const option = list.querySelector('[aria-selected="true"]')!
        const item = option.getBoundingClientRect()
        const viewport = list.getBoundingClientRect()
        return Math.abs(
          item.y + item.height / 2 - viewport.y - viewport.height / 2,
        )
      }),
    )
    .toBeLessThan(1)
}

test('wheel scrolling snaps to a new selected option', async ({ page }) => {
  const hours = await openWheel(page)
  await hours.hover()
  await page.mouse.wheel(0, 108)
  await expect(hours.getByRole('option', { selected: true })).toHaveText('12')
  await expectCentered(hours)
  await expect(page.locator('[data-slot="picker-value"]')).toHaveText('12:30')
})

test('pointer dragging selects and centers an option without a stray click', async ({
  page,
}) => {
  const hours = await openWheel(page)
  const box = (await hours.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 35)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 35, {
    steps: 12,
  })
  await page.mouse.up()
  await expect(hours.getByRole('option', { selected: true })).not.toHaveText(
    '09',
  )
  await expectCentered(hours)
  await expect
    .poll(() =>
      hours.evaluate(list => ({
        snap: (list as HTMLElement).style.scrollSnapType,
        select: (list as HTMLElement).style.userSelect,
      })),
    )
    .toEqual({ snap: '', select: '' })
})

test('PageDown moves selection and focus by one viewport page', async ({
  page,
}) => {
  const hours = await openWheel(page)
  await hours.getByRole('option', { selected: true }).focus()
  await page.keyboard.press('PageDown')
  const selected = hours.getByRole('option', { selected: true })
  await expect(selected).toHaveText('13')
  await expect(selected).toBeFocused()
  await expectCentered(hours)
})

test('arrows and clicks move the roving tab stop and focus', async ({
  page,
}) => {
  const hours = await openWheel(page)
  await hours.getByRole('option', { selected: true }).focus()
  await page.keyboard.press('ArrowDown')
  const ten = hours.getByRole('option', { name: '10', exact: true })
  await expect(ten).toHaveAttribute('aria-selected', 'true')
  await expect(ten).toBeFocused()
  await expectCentered(hours)
  await page.keyboard.press('ArrowUp')
  await expect(
    hours.getByRole('option', { name: '09', exact: true }),
  ).toBeFocused()
  await expectCentered(hours)
  await hours.getByRole('option', { name: '10', exact: true }).click()
  await expect(ten).toHaveAttribute('aria-selected', 'true')
  await expect(ten).toBeFocused()
  await expect(hours.locator('[tabindex="0"]')).toHaveCount(1)
  await expectCentered(hours)
  await page.keyboard.press('PageDown')
  await expect(hours.getByRole('option', { selected: true })).toHaveText('14')
  await expect(hours.getByRole('option', { selected: true })).toBeFocused()
})

test('leaving the page cleans up pending wheel observations without errors', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const hours = await openWheel(page)
  await hours.hover()
  await page.mouse.wheel(0, 108)
  await page.getByRole('link', { name: 'Button', exact: true }).click()
  await expect(hours).toHaveCount(0)
  await page.evaluate(() => window.dispatchEvent(new Event('resize')))
  await page.mouse.wheel(0, 36)
  await page.keyboard.press('PageDown')
  await page.waitForTimeout(250)
  expect(errors).toEqual([])
})
