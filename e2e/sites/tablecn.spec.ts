import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/* Action Bar, Data Grid, faceted Data Table and the tablecn blocks render
   and behave the same on every renderer; Tailwind (port 4173) is the
   reference the StyleX and Pleat sites are compared against. */
const TAILWIND = 'http://127.0.0.1:4173'

const collectErrors = (page: Page): string[] => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  return errors
}

const tableSummary = async (page: Page) =>
  page.evaluate(() => {
    const table = document.querySelector('[data-slot="table"], table')
    const grid = document.querySelector('[data-slot="grid"]')
    const root = grid ?? table
    const box = root?.getBoundingClientRect()
    return {
      headers: [
        ...(root?.querySelectorAll(
          'th, [data-slot="grid-header-cell"], [role="columnheader"]',
        ) ?? []),
      ]
        .map(cell => (cell.textContent ?? '').trim())
        .filter(text => text.length > 0),
      rows: root?.querySelectorAll('tbody tr, [role="row"]').length ?? 0,
      width: Math.round(box?.width ?? 0),
    }
  })

for (const slug of ['action-bar', 'data-grid', 'data-table']) {
  test(`${slug} docs render without errors`, async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto(`/docs/components/${slug}`)
    await expect(page.locator('[data-site-header]')).toBeVisible()
    if (slug === 'data-grid')
      await expect(page.locator('[data-slot="grid"]').first()).toBeVisible()
    if (slug === 'data-table')
      await expect(page.locator('table').first()).toBeVisible()
    if (slug === 'action-bar') {
      const bar = page.locator('[data-slot="action-bar"]').first()
      await page.getByRole('button', { name: 'Select 3 tasks' }).first().click()
      await expect(bar).toBeVisible()
      await expect(bar).toHaveAttribute('role', 'toolbar')
      await bar.getByRole('button', { name: 'Clear selection' }).click()
      await expect(bar).toBeHidden()
    }
    expect(errors).toEqual([])
  })
}

for (const block of ['tablecn', 'tablecn-grid']) {
  test(`${block} block matches Tailwind`, async ({ page, browser }, info) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto(`/blocks/preview/${info.project.name}--${block}`)
    const root =
      block === 'tablecn'
        ? page.locator('table').first()
        : page.locator('[data-slot="grid"]').first()
    await expect(root).toBeVisible()
    const summary = await tableSummary(page)
    expect(summary.headers.length).toBeGreaterThan(3)
    expect(summary.rows).toBeGreaterThan(3)

    if (info.project.name !== 'tailwind') {
      const reference = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
      })
      await reference.goto(`${TAILWIND}/blocks/preview/tailwind--${block}`)
      await expect(
        block === 'tablecn'
          ? reference.locator('table').first()
          : reference.locator('[data-slot="grid"]').first(),
      ).toBeVisible()
      const expected = await tableSummary(reference)
      await reference.close()
      expect(summary.headers).toEqual(expected.headers)
      expect(summary.rows).toBe(expected.rows)
      expect(Math.abs(summary.width - expected.width)).toBeLessThanOrEqual(2)
    }

    if (block === 'tablecn') {
      const bar = page.locator('[data-slot="action-bar"]')
      await root.getByRole('checkbox').nth(1).click()
      await expect(bar).toBeVisible()
      await expect(
        bar.locator('[data-slot="action-bar-selection"]'),
      ).toContainText('1')
      await bar.getByRole('button', { name: 'Clear selection' }).click()
      await expect(bar).toBeHidden()
      const results = await new AxeBuilder({ page })
        .include('table')
        .withRules(['aria-required-children', 'aria-required-parent', 'label'])
        .analyze()
      expect(results.violations).toEqual([])
    }
    expect(errors).toEqual([])
  })
}
