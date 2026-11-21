import { expect, test } from '@playwright/test'

test('more menu closes on outside press and reports a selection after reopening', async ({
  page,
}) => {
  await page.goto('/docs/components/more-menu')
  const trigger = page.getByRole('button', { name: 'Document actions' })
  const menu = page.getByRole('menu', { name: 'Document actions' })

  await trigger.click()
  await expect(menu).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')

  await page.mouse.click(1, 1)
  await expect(menu).toHaveCount(0)
  await expect(trigger).toBeFocused()

  await trigger.press('Enter')
  await menu.getByRole('menuitem', { name: 'Duplicate' }).click()
  await expect(menu).toHaveCount(0)
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(
    page.getByRole('status').filter({ hasText: 'Selected: Duplicate' }),
  ).toBeVisible()
})

test('context menu dismisses on Escape and anchors at the next right click', async ({
  page,
}) => {
  await page.goto('/docs/components/context-menu')
  const example = page.locator('#basic')
  const trigger = example.getByRole('button', { name: 'Right click here' })
  const menu = page.getByRole('menu', { name: 'Basic menu' })

  await trigger.click({ button: 'right', position: { x: 20, y: 20 } })
  await expect(menu).toBeVisible()
  const firstPosition = await menu.boundingBox()
  expect(firstPosition).not.toBeNull()

  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)
  await expect(trigger).toBeFocused()

  await trigger.click({ button: 'right', position: { x: 150, y: 20 } })
  await expect(menu).toBeVisible()
  const secondPosition = await menu.boundingBox()
  expect(secondPosition).not.toBeNull()
  expect(secondPosition!.x).toBeGreaterThan(firstPosition!.x)

  await menu.getByRole('menuitem', { name: 'Reload' }).click()
  await expect(menu).toHaveCount(0)
  await expect(example.getByRole('status')).toHaveText('Last action: Reload')
})
