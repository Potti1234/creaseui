import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

import { COMPONENTS } from '../src/docs/component-metadata'

for (const renderer of ['tailwind', 'stylex'] as const) {
  const origin = `http://127.0.0.1:${renderer === 'stylex' ? '4174' : '4173'}`

  test(`${renderer} header search covers every documentation page and navigates`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(origin)
    const trigger = page.getByRole('button', {
      name: 'Search documentation',
      exact: true,
    })
    await trigger.click()
    const dialog = page.getByRole('dialog', {
      name: 'Search documentation',
      exact: true,
    })
    const query = dialog.getByRole('combobox', {
      name: 'Search documentation pages',
    })
    await expect(query).toBeFocused()
    await expect(page.getByRole('option')).toHaveCount(COMPONENTS.length)
    await query.fill('no-such-doc-page-xyz')
    await expect(dialog.getByRole('status')).toHaveText(
      'No documentation pages found. Try another search.',
    )
    await expect(page.getByRole('option')).toHaveCount(0)
    await query.fill('Date Range Input')
    await expect(page.getByRole('option')).toHaveCount(1)
    await page.getByRole('option', { name: /^Date Range Input/ }).click()
    await expect(page).toHaveURL(`${origin}/docs/components/date-range-input`)
    await expect(dialog).not.toBeVisible()
    await expect(
      page.getByRole('heading', { level: 1, name: 'Date Range Input' }),
    ).toBeVisible()

    await page.keyboard.press('Control+k')
    await expect(query).toBeFocused()
    await expect(query).toHaveValue('')
    await query.fill('button')
    await page.keyboard.press('Home')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(`${origin}/docs/components/button`)
    await expect(dialog).not.toBeVisible()
    await trigger.click()
    await expect(query).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toBeFocused()
    expect(errors).toEqual([])
  })

  test(`${renderer} search supports shortcuts, focus trapping, and accessible themes`, async ({
    page,
  }) => {
    await page.goto(origin)
    const dialog = page.getByRole('dialog', {
      name: 'Search documentation',
      exact: true,
    })
    for (const mode of ['light', 'dark']) {
      if (mode === 'dark')
        await page.getByRole('button', { name: 'Switch to dark mode' }).click()
      await page.keyboard.press('Control+k')
      const query = dialog.getByRole('combobox', {
        name: 'Search documentation pages',
      })
      await expect(query).toBeFocused()
      await page.keyboard.press('Tab')
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              document.activeElement?.closest('#site-docs-search-dialog') !==
              null,
          ),
        )
        .toBe(true)
      await query.fill('carousel')
      await expect(
        page.getByRole('option', { name: /^Carousel/ }),
      ).toBeVisible()
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(
        result.violations,
        JSON.stringify(
          result.violations.map(v => ({
            id: v.id,
            targets: v.nodes.map(n => n.target),
          })),
        ),
      ).toEqual([])
      await page.keyboard.press('Control+k')
      await expect(dialog).not.toBeVisible()
    }
  })

  test(
    `${renderer} header and search modal fit mobile screens`,
    { tag: '@mobile' },
    async ({ page }, testInfo) => {
      for (const width of [320, 390, 640]) {
        await page.setViewportSize({ width, height: 844 })
        await page.goto(origin)
        const header = page.locator('[data-site-header]')
        const trigger = page.getByRole('button', {
          name: 'Search documentation',
          exact: true,
        })
        await expect(trigger).toBeVisible()
        const contained = await header.evaluate(node =>
          [...node.querySelectorAll('button, a, summary')]
            .filter(
              element =>
                getComputedStyle(element).display !== 'none' &&
                element.getBoundingClientRect().width > 0,
            )
            .every(
              element => element.getBoundingClientRect().right <= innerWidth,
            ),
        )
        expect(contained).toBe(true)
        await trigger.click()
        const dialog = page.getByRole('dialog', {
          name: 'Search documentation',
          exact: true,
        })
        const query = dialog.getByRole('combobox', {
          name: 'Search documentation pages',
        })
        await expect(query).toBeFocused()
        await query.fill('visually hidden')
        await expect(
          page.getByRole('option', { name: /^Visually Hidden/ }),
        ).toBeVisible()
        const panel = page.locator(
          '#site-docs-search-dialog [data-slot="dialog-content"]',
        )
        const box = await panel.boundingBox()
        expect(box).not.toBeNull()
        expect(box!.x).toBeGreaterThanOrEqual(0)
        expect(box!.x + box!.width).toBeLessThanOrEqual(width)
        if (width === 390)
          await testInfo.attach(`${renderer}-mobile-docs-search`, {
            body: await page.screenshot(),
            contentType: 'image/png',
          })
        await page.keyboard.press('Escape')
        await expect(dialog).not.toBeVisible()
      }
    },
  )
}
