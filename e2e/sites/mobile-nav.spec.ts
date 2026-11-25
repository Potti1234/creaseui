import { expect, test } from '@playwright/test'

test('Mobile Nav contains and restores focus and unlocks scroll after Escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto('/docs/components/mobile-nav')
  const trigger = page.getByRole('button', {
    name: 'Open from Right',
    exact: true,
  })
  const root = page.locator('html')
  const originalOverflow = await root.evaluate(
    element => element.style.overflow,
  )
  const nav = page.getByRole('dialog', { name: 'Settings', exact: true })
  const drawer = nav.locator('[data-slot="mobile-nav-drawer"]')

  await trigger.click()
  await expect(drawer).toBeFocused()
  await expect(drawer).toHaveAttribute('data-side', 'end')
  await expect
    .poll(() => root.evaluate(element => element.style.overflow))
    .toBe('hidden')

  await nav.getByRole('link', { name: 'Team', exact: true }).focus()
  await page.keyboard.press('Tab')
  await expect(
    nav.getByRole('button', { name: 'Close navigation' }),
  ).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(nav).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect
    .poll(() => root.evaluate(element => element.style.overflow))
    .toBe(originalOverflow)
})
