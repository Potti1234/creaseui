import { mkdir } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { BLOCKS } from '../src/demo/blocks/catalog'

for (const renderer of ['tailwind', 'stylex'] as const) {
  for (const mobile of [false, true]) {
    for (const block of BLOCKS) {
      test(`${renderer} ${block.name} ${mobile ? '@mobile' : 'desktop'}`, async ({ page }) => {
        test.setTimeout(90_000)
        const errors: string[] = []
        page.on('pageerror', error => errors.push(error.message))
        await page.setViewportSize(mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 })
        await page.goto(`/blocks/preview/${renderer}--${block.name}`)
        await expect(page.locator('[data-slot]').first()).toBeAttached()
        await expect(page.locator('[data-icon-missing]')).toHaveCount(0)
        const charts = page.locator('[data-slot="echart"]')
        for (const chart of await charts.all()) {
          await expect(chart.locator('canvas')).toBeVisible()
          const bounds = await chart.boundingBox()
          const minHeight = (await chart.getAttribute('data-size')) === 'spark' ? 40 : 150
          expect(bounds?.width).toBeGreaterThan(150)
          expect(bounds?.height).toBeGreaterThan(minHeight)
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
        if (process.env.BLOCKS_VISUAL_AUDIT) {
          const directory = `test-results/blocks-audit/${renderer}/${mobile ? 'mobile' : 'desktop'}`
          await mkdir(directory, { recursive: true })
          await page.screenshot({ path: `${directory}/${block.name}.png`, fullPage: true, animations: 'disabled', timeout: 20_000 })
        }
        if (block.category === 'login') {
          await page.getByLabel('Email', { exact: true }).fill('reader@example.com')
          await page.getByLabel('Password', { exact: true }).fill('preview-password')
          await expect(page.getByLabel('Email', { exact: true })).toHaveValue('reader@example.com')
          await expect(page.getByLabel('Password', { exact: true })).toHaveValue('preview-password')
        }
        if (mobile && block.category === 'sidebar' && block.name !== 'sidebar-13') {
          await page.locator('[data-sidebar="trigger"]:visible').first().click()
          await expect(page.locator('[data-slot="sidebar-mobile"]')).toBeVisible()
          if (process.env.BLOCKS_VISUAL_AUDIT) await page.screenshot({ path: `test-results/blocks-audit/${renderer}/mobile/${block.name}-open.png`, animations: 'disabled' })
          await page.getByRole('button', { name: 'Close sidebar', exact: true }).click()
          await expect(page.locator('[data-slot="sidebar-mobile"]')).toHaveCount(0)
        }
        if (block.name === 'sidebar-13') {
          await expect(page.getByRole('dialog')).toBeVisible()
          await page.keyboard.press('Escape')
          await expect(page.getByRole('dialog')).not.toBeVisible()
          await page.getByRole('button', { name: 'Open Dialog', exact: true }).click()
          await expect(page.getByRole('dialog')).toBeVisible()
          await page.getByRole('button', { name: 'Close', exact: true }).click()
          await expect(page.getByRole('dialog')).not.toBeVisible()
        }
        expect(errors).toEqual([])
      })
    }
  }
}

test('combined gallery preserves its category across renderer switches and names every preview', async ({ page }) => {
  test.setTimeout(90_000)
  await page.goto('/blocks')
  const switcher = page.getByRole('group', { name: 'Blocks renderer' })
  await expect(page.locator('[data-block]')).toHaveCount(31)
  await page.getByRole('button', { name: 'Authentication', exact: true }).click()
  await expect(page.locator('[data-block]')).toHaveCount(2)
  await switcher.getByRole('button', { name: 'StyleX', exact: true }).click()
  await expect(switcher.getByRole('button', { name: 'StyleX', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Authentication', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('iframe').first()).toHaveAttribute('src', '/blocks/preview/stylex--login-03')
  await expect(page.locator('iframe').first()).toHaveAttribute('title', /StyleX preview/)
  await expect(page.getByRole('link', { name: 'Open login-03 in StyleX', exact: true })).toHaveAttribute('href', '/blocks/preview/stylex--login-03')
  await switcher.getByRole('button', { name: 'Tailwind', exact: true }).click()
  await expect(page.locator('iframe').first()).toHaveAttribute('src', '/blocks/preview/tailwind--login-03')
  await page.getByRole('button', { name: 'All blocks', exact: true }).click()
  await expect(page.locator('[data-block]')).toHaveCount(31)
})

test('block code toggle swaps the preview for the matching renderer source', async ({ page }) => {
  test.setTimeout(90_000)
  await page.goto('/blocks')
  await page.getByRole('button', { name: 'Dashboards', exact: true }).click()
  const section = page.locator('[data-block="dashboard-01"]')
  const toggle = section.getByRole('button', { name: 'View code for dashboard-01', exact: true })
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await toggle.click()
  const panel = section.locator('[data-block-code="dashboard-01"]')
  await expect(panel).toBeVisible()
  await expect(panel).toContainText('src/demo/blocks/featured-page.ts')
  const fileItems = panel.locator('[data-code-file]')
  await expect(fileItems.first()).toHaveAttribute('data-code-file', '/src/demo/blocks/featured-page.ts')
  await expect(fileItems).toHaveCount(5)
  await expect(panel.locator('[data-code-view] pre code')).toContainText('const dashboard')
  await expect(panel.locator('[data-code-view] [data-line]').first()).toBeVisible()
  await expect(async () => {
    expect(await panel.locator('[data-code-view] pre code span').count()).toBeGreaterThan(5)
  }).toPass()
  const echartsItem = panel.locator('[data-code-file="/src/demo/blocks/dashboard-echarts.ts"]')
  await echartsItem.click()
  await expect(echartsItem).toHaveAttribute('aria-pressed', 'true')
  await expect(panel).toContainText('src/demo/blocks/dashboard-echarts.ts')
  await expect(panel.locator('[data-code-view] pre code')).toContainText('echarts')
  await expect(section.locator('iframe')).toHaveCount(0)
  await page.getByRole('group', { name: 'Blocks renderer' }).getByRole('button', { name: 'StyleX', exact: true }).click()
  await expect(panel).toContainText('src/demo/blocks-stylex/featured-page.ts')
  await expect(panel.locator('[data-code-view] pre code')).toContainText('const dashboard')
  await section.getByRole('button', { name: 'Hide code for dashboard-01', exact: true }).click()
  await expect(section.locator('iframe')).toHaveAttribute('src', '/blocks/preview/stylex--dashboard-01')
})

test('legacy gallery and block URLs remain available', async ({ page }) => {
  await page.goto('/blocks-stylex')
  await expect(page.getByRole('group', { name: 'Blocks renderer' }).getByRole('button', { name: 'StyleX', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.goto('/blocks/sidebar')
  await expect(page.getByRole('heading', { name: 'Building Blocks for Foldkit' })).toBeVisible()
  await page.goto('/blocks/sidebar/07')
  await expect(page.locator('[data-slot="sidebar-wrapper"]')).toBeVisible()
  await expect(page.getByRole('link', { name: 'crease/ui', exact: true })).toHaveCount(0)
})

test('StyleX sidebar disclosure, calendar, dropdown and dialog stay interactive', async ({ page }) => {
  await page.goto('/blocks/preview/stylex--sidebar-07')
  const models = page.getByRole('button', { name: 'Models', exact: true })
  await models.click()
  await expect(models).toHaveAttribute('aria-expanded', 'true')
  await page.goto('/blocks/preview/stylex--sidebar-06')
  await page.getByRole('button', { name: 'Getting Started', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Installation', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.goto('/blocks/preview/stylex--sidebar-12')
  await page.getByRole('checkbox', { name: 'Family', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: 'Family', exact: true })).toBeChecked()
  await page.goto('/blocks/preview/stylex--sidebar-13')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.getByRole('button', { name: 'Open Dialog', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
})


test('gallery previews follow the selected theme in both renderers', async ({ page }) => {
  await page.goto('/blocks')
  await page.getByRole('button', { name: 'Authentication', exact: true }).click()
  await page.getByRole('button', { name: 'Switch to dark mode', exact: true }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.frameLocator('iframe').first().locator('html')).toHaveClass(/dark/)
  await page.getByRole('group', { name: 'Blocks renderer' }).getByRole('button', { name: 'StyleX', exact: true }).click()
  await expect(page.frameLocator('iframe').first().locator('html')).toHaveClass(/dark/)
  await page.getByRole('button', { name: 'Switch to light mode', exact: true }).click()
  await expect(page.frameLocator('iframe').first().locator('html')).not.toHaveClass(/dark/)
})
