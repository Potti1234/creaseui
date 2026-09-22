import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('semantic dashboard recipe preserves region ownership and responsive containment', async ({ page }) => {
  await page.goto('/blocks/preview/stylex--dashboard-01')

  const dashboard = page.locator('[data-recipe="dashboard"]')
  await expect(dashboard).toBeVisible()
  await expect(page.locator('[data-semantic-theme="comfortable"]').first()).toBeVisible()
  await expect(dashboard.locator('[data-region="table"]')).toBeVisible()
  await expect(dashboard.getByRole('table', { name: 'Document sections' })).toBeVisible()
  await expect(dashboard.locator('[data-slot="echart"]')).toHaveCount(1)
  await expect(dashboard.locator('canvas')).toHaveCount(1)

  const accessibility = await new AxeBuilder({ page })
    .include('[data-recipe="dashboard"]')
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
  const blocks = [
    ['astryx-executive-summary', 2],
    ['astryx-cohort-funnel', 1],
    ['astryx-project-status', 2],
    ['astryx-service-monitoring', 2],
    ['astryx-incident-console', 0],
    ['astryx-kanban-board', 0],
    ['astryx-inbox-table', 0],
    ['astryx-order-detail', 0],
    ['astryx-checkout-form', 0],
    ['astryx-data-dashboard', 4],
    ['astryx-card-grid', 0],
  ] as const
  for (const [name, charts] of blocks) {
    await page.setViewportSize({width: 1440, height: 1000})
    await page.goto(`/blocks/preview/stylex--${name}`)
    await expect(page.locator('[data-recipe]')).toBeAttached()
    await expect(page.locator('[data-slot="echart"]')).toHaveCount(charts)
    await expect(page.locator('canvas')).toHaveCount(charts)
    const accessibility = await new AxeBuilder({page}).include('[data-recipe]').analyze()
    expect(accessibility.violations.filter(({impact}) => impact === 'serious' || impact === 'critical')).toEqual([])
    await page.setViewportSize({width:390,height:900})
    await expect.poll(() => page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
})

test('StyleX analytics block mounts every Apache ECharts family', async ({ page }) => {
  await page.goto('/blocks/preview/stylex--chart-analytics-dashboard')

  const block = page.locator('[data-recipe]')
  await expect(block).toBeAttached()
  await expect(block.locator('[data-slot="echart"]')).toHaveCount(6)
  await expect(block.locator('canvas')).toHaveCount(6)

  const accessibility = await new AxeBuilder({ page })
    .include('[data-recipe]')
    .analyze()
  expect(accessibility.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')).toEqual([])

  await page.setViewportSize({ height: 900, width: 390 })
  const metrics = await block.evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }))
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
})

test('unified charts routes expose the complete constrained StyleX gallery', async ({ page }) => {
  await page.goto('/charts/area')
  const headingName = 'Beautiful Charts & Graphs'
  const description = 'A collection of ready-to-use chart components built with Apache ECharts and foldkit, styled like shadcn/ui. From basic charts to rich data displays.'
  const topLayout = async () => page.getByRole('heading', { level: 1, name: headingName }).evaluate((heading) => {
    const header = heading.parentElement
    const shell = header?.parentElement
    const activeTab = shell?.querySelector<HTMLAnchorElement>('a[href="/charts/area"]')
    const tabs = activeTab?.parentElement
    if (header === null || header === undefined || shell === null || shell === undefined || activeTab === null || activeTab === undefined || tabs === null || tabs === undefined) throw new Error('Chart gallery header structure is incomplete')
    const shellStyle = getComputedStyle(shell)
    const headingStyle = getComputedStyle(heading)
    const descriptionStyle = getComputedStyle(header.querySelector('p')!)
    const tabsStyle = getComputedStyle(tabs)
    const activeTabStyle = getComputedStyle(activeTab)
    return {
      activeTab: [activeTabStyle.backgroundColor, activeTabStyle.color, activeTabStyle.fontSize, activeTabStyle.fontWeight, activeTabStyle.height, activeTabStyle.paddingInline],
      description: [descriptionStyle.color, descriptionStyle.fontSize, descriptionStyle.lineHeight, descriptionStyle.maxWidth],
      heading: [headingStyle.color, headingStyle.fontSize, headingStyle.fontWeight, headingStyle.letterSpacing, headingStyle.lineHeight, headingStyle.maxWidth],
      shell: [shellStyle.gap, shellStyle.maxWidth, shellStyle.paddingBlock, shellStyle.paddingInline],
      tabs: [tabsStyle.borderBottomWidth, tabsStyle.gap, tabsStyle.paddingBottom],
    }
  })
  const tailwindTopLayout = await topLayout()
  await page
    .getByRole('group', { name: 'Charts renderer' })
    .getByRole('button', { name: 'StyleX' })
    .click()

  const pageRoot = page.locator('[data-page="charts-stylex"]')
  await expect(pageRoot.getByRole('heading', { level: 1, name: headingName })).toBeVisible()
  await expect(pageRoot.getByText(description, { exact: true })).toBeVisible()
  expect(await topLayout()).toEqual(tailwindTopLayout)
  await expect(pageRoot.locator('[data-slot="echart"]')).toHaveCount(10)
  await expect(pageRoot.locator('canvas')).toHaveCount(10)
  const areaRange = pageRoot.getByRole('group', { name: 'Area range' })
  await areaRange.getByRole('button', { name: '7d' }).click()
  await expect(areaRange.getByRole('button', { name: '7d' })).toHaveAttribute('aria-pressed', 'true')

  const renderer = page.getByRole('group', { name: 'Charts renderer' })
  await renderer.getByRole('button', { name: 'Tailwind' }).click()
  await renderer.getByRole('button', { name: 'StyleX' }).click()
  await expect(areaRange.getByRole('button', { name: '7d' })).toHaveAttribute('aria-pressed', 'true')

  const accessibility = await new AxeBuilder({ page }).include('[data-page="charts-stylex"]').analyze()
  expect(accessibility.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')).toEqual([])

  await page.setViewportSize({ height: 900, width: 390 })
  const metrics = await pageRoot.evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }))
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)

  const sections = [
    ['Bar Charts', 'bar', 10],
    ['Line Charts', 'line', 10],
    ['Pie Charts', 'pie', 11],
    ['Radar Charts', 'radar', 14],
    ['Radial Charts', 'radial', 6],
    ['Tooltip', 'tooltip', 9],
  ] as const
  for (const [label, section, count] of sections) {
    await pageRoot.getByRole('link', { name: label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`/charts/${section}$`, 'u'))
    await expect(page.getByRole('group', { name: 'Charts renderer' }).getByRole('button', { name: 'StyleX' })).toHaveAttribute('aria-pressed', 'true')
    await expect(pageRoot.locator('[data-slot="echart"]')).toHaveCount(count)
    await expect(pageRoot.locator('canvas')).toHaveCount(count)
  }

  await page.goto('/charts-stylex')
  await expect(page.getByText('No page at /charts-stylex.')).toBeVisible()
})
