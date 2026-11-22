import { expect, test } from '@playwright/test'

test('menubar moves the tab stop without selecting a menu', async ({
  page,
}) => {
  await page.goto('/docs/components/menubar')
  const bar = page.getByRole('menubar').first()
  const triggers = bar.locator('[data-slot="dropdown-menu-trigger"]')
  const tabStop = bar.locator(
    '[data-slot="dropdown-menu-trigger"][tabindex="0"]',
  )
  await expect(tabStop).toHaveCount(1)
  await expect(triggers.first()).toHaveAttribute('tabindex', '0')
  await triggers.first().focus()
  await page.keyboard.press('ArrowLeft')
  await expect(triggers.last()).toBeFocused()
  await expect(triggers.last()).toHaveAttribute('tabindex', '0')
  await page.keyboard.press('Home')
  await expect(triggers.first()).toBeFocused()
  await page.keyboard.press('End')
  await expect(triggers.last()).toBeFocused()
  await expect(tabStop).toHaveCount(1)
  await expect(
    bar.locator('[aria-current="true"], [aria-expanded="true"]'),
  ).toHaveCount(0)
})

test('toolbar wraps and skips a disabled item', async ({ page }) => {
  await page.goto('/docs/components/toolbar')
  const bar = page.getByRole('toolbar', { name: 'Document toolbar' })
  const first = bar.getByRole('button', { name: 'Back' })
  const middle = bar.getByRole('button', { name: 'Discard' })
  const last = bar.getByRole('button', { name: 'Save' })
  await expect(first).toHaveAttribute('tabindex', '0')
  await middle.evaluate(element => element.setAttribute('disabled', ''))
  await first.focus()
  await page.keyboard.press('ArrowRight')
  await expect(last).toBeFocused()
  await expect(last).toHaveAttribute('tabindex', '0')
  await page.keyboard.press('ArrowRight')
  await expect(first).toBeFocused()
  await page.keyboard.press('End')
  await expect(last).toBeFocused()
  await page.keyboard.press('Home')
  await expect(first).toBeFocused()
  await expect(bar.locator('[tabindex="0"]')).toHaveCount(1)
})

test('RTL carousel maps arrows to Embla scroll snaps without moving focus', async ({
  page,
}) => {
  await page.goto('/docs/components/carousel')
  const carousel = page.getByRole('region', { name: 'RTL slides' })
  const viewport = carousel.locator('[data-slot="carousel-content"]')
  await expect(
    carousel.getByRole('button', { name: 'Previous slide' }),
  ).toBeDisabled()
  await viewport.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(carousel.getByRole('group', { name: '2 of 5' })).toBeInViewport()
  await expect(viewport).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(carousel.getByRole('group', { name: '1 of 5' })).toBeInViewport()
  await page.keyboard.press('End')
  await expect(carousel.getByRole('group', { name: '5 of 5' })).toBeInViewport()
  await page.keyboard.press('Home')
  await expect(carousel.getByRole('group', { name: '1 of 5' })).toBeInViewport()
})

test('nav dropdown moves one tab stop and restores focus on Escape', async ({
  page,
}) => {
  await page.goto('/docs/components/top-nav')
  const nav = page.locator('[id="topnav-—-hover-menu"]')
  const trigger = nav.getByRole('button', { name: 'Products', exact: true })
  const menu = nav.getByRole('menu', { name: 'Products', exact: true })
  const items = menu.getByRole('menuitem')
  await trigger.press('Enter')
  await expect(items.first()).toBeFocused()
  await expect(items.first()).toHaveAttribute('tabindex', '0')
  await page.keyboard.press('ArrowDown')
  await expect(items.nth(1)).toBeFocused()
  await expect(items.first()).toHaveAttribute('tabindex', '-1')
  await page.keyboard.press('End')
  await expect(items.last()).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(items.first()).toBeFocused()
  await expect(menu.locator('[tabindex="0"]')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)
  await expect(trigger).toBeFocused()
})
