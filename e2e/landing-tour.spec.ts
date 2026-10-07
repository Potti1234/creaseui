import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const renderer of ['tailwind', 'stylex'] as const) {
  const origin =
    (renderer === 'stylex'
      ? process.env.STYLEX_BASE_URL
      : process.env.TAILWIND_BASE_URL) ??
    `http://127.0.0.1:${renderer === 'stylex' ? '4174' : '4173'}`

  test(`${renderer} landing tour preserves interactive state and theme`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(origin)
    await expect(page.locator('html')).toHaveAttribute(
      'data-renderer',
      renderer,
    )
    await page.getByRole('tab', { name: 'Inbox', exact: true }).click()
    const preview = page.getByTitle('Inbox application preview')
    await expect(preview).toHaveAttribute(
      'src',
      new RegExp(`/blocks/preview/${renderer}--creaseui-inbox-table`),
    )
    await page
      .getByRole('button', { name: 'Showcase Blue', exact: true })
      .click()
    await expect(
      page.getByRole('button', { name: 'Showcase Blue', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true')

    await page
      .getByRole('button', { name: 'Studio Violet', exact: true })
      .click()
    const join = page.getByRole('button', {
      name: 'Join this workspace',
      exact: true,
    })
    await expect
      .poll(() =>
        join.evaluate(node => {
          const logo = node
            .closest('[data-studio-preview]')
            ?.querySelector(':scope > div > div > span')
          return (
            logo !== undefined &&
            logo !== null &&
            getComputedStyle(node).backgroundColor ===
              getComputedStyle(logo).backgroundColor
          )
        }),
      )
      .toBe(true)
    await page.getByRole('button', { name: 'Square', exact: true }).click()
    await expect(
      page.getByRole('button', { name: 'Square', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect
      .poll(() =>
        page
          .locator('[data-studio-preview]')
          .evaluate(node =>
            getComputedStyle(node).getPropertyValue('--radius').trim(),
          ),
      )
      .toBe('0')
    await expect
      .poll(() => join.evaluate(node => getComputedStyle(node).borderRadius))
      .toBe('0px')
    await page
      .getByRole('button', { name: 'Join this workspace', exact: true })
      .click()
    await expect(
      page.getByText('You joined the workspace', { exact: true }),
    ).toBeVisible()

    const project = page.getByRole('textbox', {
      name: 'Project name',
      exact: true,
    })
    await project.fill('StyleX launch')
    await expect(page.locator('[data-model-inspector]')).toContainText(
      'StyleX launch',
    )
    await expect(page.locator('[data-event-log]')).toContainText(
      'ChangedProjectName',
    )
    await page.getByRole('button', { name: 'Open dialog', exact: true }).click()
    await expect(
      page.getByRole('dialog', { name: 'StyleX launch' }),
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.locator('[data-model-inspector]')).toContainText('false')

    const form = page.getByRole('form', { name: 'Email validation demo' })
    await form.getByRole('textbox', { name: 'Your email' }).fill('invalid')
    await form.getByRole('button', { name: 'Check email' }).click()
    await expect(page.locator('#landing-email-feedback')).toHaveText(
      'Enter a valid email address.',
    )
    await form
      .getByRole('textbox', { name: 'Your email' })
      .fill('hello@example.com')
    await form.getByRole('button', { name: 'Check email' }).click()
    await expect(page.locator('#landing-email-feedback')).toHaveText(
      'Looks good. You’re ready to go.',
    )

    await page.getByRole('button', { name: '7 days', exact: true }).click()
    await expect(
      page.getByRole('img', { name: 'Visitors and signups over 7 days' }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Signups', exact: true }).click()
    await expect(page.getByText('Total signups', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Switch to dark mode' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(preview).toHaveAttribute('src', /appearance=dark/)
    await expect(page.locator('.landing-studio')).toHaveAttribute(
      'data-appearance',
      'dark',
    )
    expect(errors).toEqual([])
  })

  test(`${renderer} landing meets WCAG AA in light and dark mode`, async ({
    page,
  }) => {
    await page.goto(origin)
    await expect(
      page.getByRole('heading', { name: 'Make it yours.' }),
    ).toBeVisible()
    for (const mode of ['light', 'dark']) {
      if (mode === 'dark')
        await page.getByRole('button', { name: 'Switch to dark mode' }).click()
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(
        results.violations,
        JSON.stringify(
          results.violations.map(v => ({
            id: v.id,
            targets: v.nodes.map(n => n.target),
          })),
        ),
      ).toEqual([])
    }
  })

  test(
    `${renderer} landing is contained on mobile`,
    { tag: '@mobile' },
    async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(origin)
      await expect(
        page.getByRole('heading', {
          name: 'Beautiful components for foldkit.',
        }),
      ).toBeVisible()
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth - window.innerWidth,
          ),
        )
        .toBeLessThanOrEqual(1)
      await page.getByRole('tab', { name: 'Checkout', exact: true }).click()
      await expect(
        page.getByTitle('Checkout application preview'),
      ).toHaveAttribute(
        'src',
        new RegExp(`/blocks/preview/${renderer}--creaseui-checkout-form`),
      )
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth - window.innerWidth,
          ),
        )
        .toBeLessThanOrEqual(1)
    },
  )
}
