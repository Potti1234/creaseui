import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = Object.fromEntries(Object.entries({
  docs: 'docs/stylex-astryx-architecture.md',
  featured: 'src/demo/blocks-stylex/featured-page.ts',
  inspired: 'src/demo/blocks-stylex/astryx-inspired-dashboards.ts',
  charts: 'src/demo/blocks-stylex/chart-analytics-dashboard.ts',
  chartsPage: 'src/demo/charts-stylex/page.ts',
  layout: 'src/stylex/composition/semantic-layout.ts',
  recipes: 'src/stylex/composition/recipes.ts',
  templates: 'src/stylex/composition/templates.ts',
  theme: 'src/stylex/composition/semantic-theme.stylex.ts',
}).map(([name, file]) => [name, readFileSync(file, 'utf8')]))

for (const reference of ['how-astryx-works', '/docs/layout', '/docs/theme', '/docs/cli']) {
  assert.match(source.docs, new RegExp(reference.replaceAll('/', '\\/'), 'u'))
}
for (const recipe of ['dashboardShell', 'settingsPage', 'masterDetailPage', 'dataExplorerPage', 'commercePage']) {
  assert.match(source.recipes, new RegExp(`export const ${recipe}\\b`, 'u'), `missing recipe ${recipe}`)
}
for (const component of ['appShell', 'pageLayout', 'section', 'toolbar', 'formLayout', 'metricGrid', 'tableRegion']) {
  assert.match(source.layout, new RegExp(`export const ${component}\\b`, 'u'), `missing semantic layout ${component}`)
}
for (const escapeHatch of ['className', 'layoutStyle', 'unsafeStyle', 'xstyle']) {
  assert.doesNotMatch(source.layout, new RegExp(`${escapeHatch}\\?`, 'u'))
  assert.doesNotMatch(source.recipes, new RegExp(`${escapeHatch}\\?`, 'u'))
}
assert.doesNotMatch(source.layout, /@stylexjs\/stylex|h\.(?:Class|Style)\s*\(/u)
assert.doesNotMatch(source.recipes, /@stylexjs\/stylex|h\.(?:Class|Style)\s*\(/u)
assert.doesNotMatch(source.inspired, /@stylexjs\/stylex|h\.(?:article|aside|div|footer|header|li|main|nav|ol|section|ul|Class|Style)\s*\(/u)
assert.doesNotMatch(source.charts, /@stylexjs\/stylex|h\.(?:article|aside|div|footer|header|li|main|nav|ol|section|ul|Class|Style)\s*\(/u)
assert.doesNotMatch(source.chartsPage, /@stylexjs\/stylex|h\.(?:article|aside|div|footer|header|li|main|nav|ol|section|ul|Class|Style)\s*\(/u)
assert.doesNotMatch(source.layout, /\b\d+(?:px|rem)\b/u)
assert.doesNotMatch(source.recipes, /\b\d+(?:px|rem)\b/u)
for (const call of ['dashboardShell', 'metricGrid', 'section', 'tableRegion', 'toolbar']) {
  assert.match(source.featured, new RegExp(`\\b${call}\\s*\\(`, 'u'), `featured dashboard must use ${call}`)
}
for (const dashboard of ['executiveSummaryDashboard', 'cohortFunnelDashboard', 'projectStatusDashboard', 'serviceMonitoringDashboard', 'incidentConsoleDashboard']) {
  assert.match(source.inspired, new RegExp(`export const ${dashboard}\\b`, 'u'), `missing inspired dashboard ${dashboard}`)
}
assert.match(source.charts, /export const chartAnalyticsDashboard\b/u, 'missing StyleX ECharts analytics dashboard')
for (const family of ['AREA_HOST', 'BAR_HOST', 'LINE_HOST', 'PIE_HOST', 'RADAR_HOST', 'RADIAL_HOST']) {
  assert.match(source.charts, new RegExp(`\\b${family}\\b`, 'u'), `missing ECharts family ${family}`)
}
assert.match(source.chartsPage, /export const view\b/u, 'missing StyleX charts renderer')
for (const family of ['area', 'bar', 'line', 'pie', 'radar', 'radial', 'tooltip']) {
  assert.match(source.chartsPage, new RegExp(`\\b${family}: specs\\('${family}'`, 'u'), `missing StyleX chart page family ${family}`)
}
assert.match(source.layout, /pageHeader[\s\S]*padding: densitySpace/u)
assert.match(source.layout, /pageFooter[\s\S]*padding: densitySpace/u)
assert.match(source.layout, /data: \{ region: 'table' \}/u)
assert.match(source.templates, /as const satisfies ReadonlyArray<TemplateDefinition>/u)
for (const token of ['controlSmall', 'focusWidth', 'elevationLow', 'durationFast', 'typeBodySize', 'regionCompact', 'contentReadable']) {
  assert.match(source.theme, new RegExp(`\\b${token}:`, 'u'), `missing semantic token ${token}`)
}
console.log('Astryx-inspired constrained template system guard passed')
