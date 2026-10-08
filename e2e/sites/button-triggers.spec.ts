import { expect, test } from '@playwright/test'
import type { Locator } from '@playwright/test'

const appearance = (button: Locator) =>
  button.evaluate(element => {
    const css = getComputedStyle(element)
    return {
      radius: css.borderRadius,
      background: css.backgroundColor,
      color: css.color,
      border: css.borderTopColor,
      height: css.height,
      fontSize: css.fontSize,
      fontWeight: css.fontWeight,
      padding: css.paddingInline,
    }
  })

test('StyleX overlay triggers render the standard Button and preserve behavior', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'stylex')
  await page.goto('/docs/components/button')
  await page.addStyleTag({
    content:
      '*,*::before,*::after{transition:none!important;animation:none!important}',
  })
  await page.mouse.move(0, 0)
  const reference = page
    .locator(
      '[data-slot="button"][data-variant="outline"][data-size="default"]',
    )
    .first()
  await expect(reference).toBeVisible()
  const standard = await appearance(reference)
  expect(Number.parseFloat(standard.radius)).toBeGreaterThan(0)

  for (const [slug, selector] of [
    ['dropdown-menu', '#basic [data-slot="dropdown-menu-trigger"]'],
    ['popover', '#basic [data-slot="popover-trigger"]'],
    ['tooltip', 'button[data-slot="tooltip-trigger"]'],
  ]) {
    await page.goto(`/docs/components/${slug}`)
    await page.addStyleTag({
      content:
        '*,*::before,*::after{transition:none!important;animation:none!important}',
    })
    await page.mouse.move(0, 0)
    const trigger = page.locator(selector).first()
    await expect(trigger).toBeVisible()
    await expect(trigger).toHaveAttribute('data-variant', 'outline')
    await expect(trigger).toHaveAttribute('data-state', 'idle')
    await expect(
      trigger.locator(':scope > [data-slot="button-content"]'),
    ).toHaveCount(1)
    await expect(trigger.locator('button')).toHaveCount(0)
    expect(await appearance(trigger)).toEqual(standard)

    if (slug === 'tooltip') {
      await trigger.focus()
      await expect(page.getByRole('tooltip')).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(page.getByRole('tooltip')).toHaveCount(0)
    } else {
      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(
        page.locator(
          slug === 'dropdown-menu'
            ? '#basic [role="menu"]'
            : '[data-slot="popover-content"]',
        ),
      ).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(trigger).toBeFocused()
    }
  }
})

test('StyleX compact buttons keep rounded corners and tooltip buttons keep native disabled state', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'stylex')
  await page.goto('/docs/components/button')
  for (const size of ['xs', 'sm', 'icon-xs', 'icon-sm']) {
    const button = page
      .locator(`[data-slot="button"][data-size="${size}"]`)
      .first()
    await expect(button).toBeVisible()
    expect(
      Number.parseFloat((await appearance(button)).radius),
    ).toBeGreaterThan(0)
  }
  await page.goto('/docs/components/tooltip')
  const disabled = page.getByRole('button', { name: 'Disabled', exact: true })
  await expect(disabled).toBeDisabled()
  await expect(disabled).toHaveAttribute('data-variant', 'outline')
  await expect(disabled.locator('[data-slot="button-content"]')).toHaveCount(1)
  expect(
    await disabled.evaluate(element => getComputedStyle(element).opacity),
  ).toBe('0.5')
})
