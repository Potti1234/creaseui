import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('semantic dashboard recipe preserves region ownership and responsive containment', async ({ page }) => {
  await page.goto('/blocks-stylex')

  const dashboard = page.locator('[data-block="dashboard-01"] [data-recipe="dashboard"]')
  await expect(dashboard).toBeVisible()
  await expect(page.locator('[data-semantic-theme="comfortable"]').first()).toBeVisible()
  await expect(dashboard.locator('[data-region="table"]')).toBeVisible()
  await expect(dashboard.getByRole('table', { name: 'Document sections' })).toBeVisible()
  await expect(dashboard.locator('[data-slot="echart"]')).toHaveCount(1)
  await expect(dashboard.locator('canvas')).toHaveCount(1)

  const accessibility = await new AxeBuilder({ page })
    .include('[data-block="dashboard-01"] [data-recipe="dashboard"]')
    .analyze()
  expect(accessibility.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')).toEqual([])

  const desktop = await dashboard.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }))
  expect(desktop.scrollWidth).toBeLessThanOrEqual(desktop.clientWidth + 1)

  await page.setViewportSize({ height: 900, width: 390 })
  await expect(dashboard).toBeVisible()
  await expect(dashboard.locator('nav')).toBeHidden()
  const mobile = await dashboard.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }))
  expect(mobile.scrollWidth).toBeLessThanOrEqual(mobile.clientWidth + 1)
})

test('Astryx-inspired dashboards use constrained recipes and remain accessible', async ({ page }) => {
  test.slow()
  await page.goto('/blocks-stylex')

  const names = [
    'astryx-executive-summary',
    'astryx-cohort-funnel',
    'astryx-project-status',
    'astryx-service-monitoring',
    'astryx-incident-console',
  ] as const

  for (const name of names) {
    const block = page.locator(`[data-block="${name}"]`)
    await expect(block).toBeAttached()
    await expect(block.locator('[data-recipe]')).toBeAttached()
  }
  await expect(page.locator('[data-block^="astryx-"] [data-slot="echart"]')).toHaveCount(7)
  await expect(page.locator('[data-block^="astryx-"] canvas')).toHaveCount(7)

  const accessibility = await new AxeBuilder({ page })
    .include('[data-block^="astryx-"]')
    .analyze()
  expect(accessibility.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')).toEqual([])

  await page.setViewportSize({ height: 900, width: 390 })
  for (const name of names) {
    const block = page.locator(`[data-block="${name}"]`)
    const metrics = await block.evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }))
    expect(metrics.scrollWidth, `${name} should contain horizontal overflow`).toBeLessThanOrEqual(metrics.clientWidth + 1)
  }
})

test('StyleX analytics block mounts every Apache ECharts family', async ({ page }) => {
  await page.goto('/blocks-stylex')

  const block = page.locator('[data-block="chart-analytics-dashboard"]')
  await expect(block).toBeAttached()
  await expect(block.locator('[data-slot="echart"]')).toHaveCount(6)
  await expect(block.locator('canvas')).toHaveCount(6)

  const accessibility = await new AxeBuilder({ page })
    .include('[data-block="chart-analytics-dashboard"] [data-recipe]')
    .analyze()
  expect(accessibility.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')).toEqual([])

  await page.setViewportSize({ height: 900, width: 390 })
  const metrics = await block.evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }))
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
})

test('dedicated StyleX charts page mounts all constrained chart variants', async ({ page }) => {
  await page.goto('/charts-stylex')

  const pageRoot = page.locator('[data-page="charts-stylex"]')
  await expect(pageRoot.getByRole('heading', { level: 1, name: 'Beautiful charts, constrained by design' })).toBeVisible()
  await expect(pageRoot.locator('[data-slot="echart"]')).toHaveCount(8)
  await expect(pageRoot.locator('canvas')).toHaveCount(8)

  const accessibility = await new AxeBuilder({ page }).include('[data-page="charts-stylex"]').analyze()
  expect(accessibility.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')).toEqual([])

  await page.setViewportSize({ height: 900, width: 390 })
  const metrics = await pageRoot.evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }))
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
})
