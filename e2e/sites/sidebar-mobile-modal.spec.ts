import { expect, test, type Page } from '@playwright/test'

/* Consumer finding: on phones the open Sidebar must be a real modal surface,
   with focus kept inside it, the page behind inert, and focus returned to
   the trigger on close. */
const modal = (page: Page) => page.locator('[data-slot="sidebar-mobile-modal"]')

const open = async (page: Page) => {
  const trigger = page.locator('[data-sidebar="trigger"]:visible').first()
  await trigger.click()
  await expect(modal(page)).toBeVisible()
  await expect(page.locator('[data-slot="sidebar-mobile"]')).toBeVisible()
  return trigger
}

const focusIsInside = (page: Page) =>
  page.evaluate(
    () =>
      document.activeElement?.closest('[data-slot="sidebar-mobile-modal"]') !==
      null,
  )

const closedWithFocusOn = async (
  page: Page,
  trigger: ReturnType<Page['locator']>,
) => {
  await expect(modal(page)).toHaveCount(0)
  await expect
    .poll(() => trigger.evaluate(element => element === document.activeElement))
    .toBe(true)
}

test('mobile Sidebar traps focus, isolates the page and returns focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/docs/components/sidebar')

  const trigger = await open(page)
  await expect(page.getByRole('dialog', { name: 'Sidebar' })).toBeVisible()
  await expect.poll(() => focusIsInside(page)).toBe(true)
  for (let step = 0; step < 25; step += 1) {
    await page.keyboard.press(step % 5 === 4 ? 'Shift+Tab' : 'Tab')
    expect(await focusIsInside(page)).toBe(true)
  }
  expect(
    await trigger.evaluate(element => element.matches('[inert], [inert] *')),
  ).toBe(true)
  await page.keyboard.press('Escape')
  await closedWithFocusOn(page, trigger)
  expect(
    await trigger.evaluate(element => element.matches('[inert], [inert] *')),
  ).toBe(false)

  await open(page)
  await page.mouse.click(380, 400)
  await closedWithFocusOn(page, trigger)

  await open(page)
  await page.getByRole('button', { name: 'Close sidebar', exact: true }).click()
  await closedWithFocusOn(page, trigger)
  expect(errors).toEqual([])
})

const pageIsInert = (page: Page) =>
  page.evaluate(() => document.querySelector('[inert]') !== null)

test('an open mobile Sidebar is modal only while the viewport shows it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/docs/components/sidebar')

  await open(page)
  await expect.poll(() => pageIsInert(page)).toBe(true)

  await page.setViewportSize({ width: 1280, height: 900 })
  await expect.poll(() => pageIsInert(page)).toBe(false)
  await expect(
    page
      .getByRole('navigation', { name: 'Site navigation' })
      .getByRole('link', {
        name: 'Docs',
      }),
  ).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('[data-slot="sidebar-mobile"]')).toBeVisible()
  await expect.poll(() => pageIsInert(page)).toBe(true)
  await page.keyboard.press('Escape')
  await expect(modal(page)).toHaveCount(0)
  await expect.poll(() => pageIsInert(page)).toBe(false)
  expect(errors).toEqual([])
})
