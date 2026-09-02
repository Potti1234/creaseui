import type { EChartsOption } from 'echarts/types/dist/shared'
import { Schema as S } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { badge } from '@/stylex/badge'
import { box, grid, inline, section, stack, text } from '@/stylex/composition'
import * as Chart from '@/stylex/integrations/echarts'

export const Model = S.Struct({})
export type Model = typeof Model.Type
export const Message = Chart.ChartMessage
export type Message = Chart.ChartMessage
export const init = (): Model => ({})
export const update = (model: Model, _message: Message): readonly [Model, readonly []] => [model, []]

const HOSTS = {
  area: 'stylex-gallery-area',
  areaStacked: 'stylex-gallery-area-stacked',
  bar: 'stylex-gallery-bar',
  barHorizontal: 'stylex-gallery-bar-horizontal',
  line: 'stylex-gallery-line',
  pie: 'stylex-gallery-pie',
  radar: 'stylex-gallery-radar',
  radial: 'stylex-gallery-radial',
} as const

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const DESKTOP = [186, 305, 237, 273, 309, 354]
const MOBILE = [80, 200, 120, 190, 210, 248]

Chart.registerChart(HOSTS.area, (theme): EChartsOption => ({
  grid: Chart.compactGrid(),
  series: [{ areaStyle: { color: Chart.areaGradient(theme.chart1, { from: 0.48, to: 0.03 }) }, data: DESKTOP, itemStyle: { color: theme.chart1 }, lineStyle: { color: theme.chart1, width: 2 }, name: 'Desktop', showSymbol: false, smooth: 0.4, type: 'line' }],
  tooltip: Chart.shadcnTooltip(theme),
  xAxis: Chart.categoryAxis(theme, MONTHS),
  yAxis: Chart.valueAxis(theme),
}))

Chart.registerChart(HOSTS.areaStacked, (theme): EChartsOption => ({
  grid: Chart.compactGrid({ bottom: 42 }),
  legend: Chart.shadcnLegend(theme),
  series: [
    { areaStyle: { color: Chart.colorWithOpacity(theme.chart1, 0.28) }, data: DESKTOP, itemStyle: { color: theme.chart1 }, lineStyle: { color: theme.chart1, width: 2 }, name: 'Desktop', showSymbol: false, smooth: 0.35, stack: 'traffic', type: 'line' },
    { areaStyle: { color: Chart.colorWithOpacity(theme.chart2, 0.24) }, data: MOBILE, itemStyle: { color: theme.chart2 }, lineStyle: { color: theme.chart2, width: 2 }, name: 'Mobile', showSymbol: false, smooth: 0.35, stack: 'traffic', type: 'line' },
  ],
  tooltip: Chart.shadcnTooltip(theme),
  xAxis: Chart.categoryAxis(theme, MONTHS),
  yAxis: Chart.valueAxis(theme),
}))

Chart.registerChart(HOSTS.bar, (theme): EChartsOption => ({
  grid: Chart.compactGrid(),
  series: [
    { data: DESKTOP, itemStyle: { borderRadius: 4, color: theme.chart1 }, name: 'Desktop', type: 'bar' },
    { data: MOBILE, itemStyle: { borderRadius: 4, color: theme.chart2 }, name: 'Mobile', type: 'bar' },
  ],
  tooltip: Chart.shadcnTooltip(theme),
  xAxis: Chart.categoryAxis(theme, MONTHS, { boundaryGap: true }),
  yAxis: Chart.valueAxis(theme),
}))

Chart.registerChart(HOSTS.barHorizontal, (theme): EChartsOption => ({
  grid: Chart.compactGrid({ bottom: 12, left: 20 }),
  series: [{ data: [275, 242, 218, 186, 154], itemStyle: { borderRadius: [0, 4, 4, 0], color: theme.chart2 }, name: 'Visitors', type: 'bar' }],
  tooltip: Chart.shadcnTooltip(theme, { trigger: 'axis' }),
  xAxis: { axisLabel: { color: theme.mutedForeground, fontFamily: theme.fontFamily, fontSize: 12, show: false }, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: theme.border, type: 'dashed' } }, type: 'value' },
  yAxis: { axisLabel: { color: theme.mutedForeground, fontFamily: theme.fontFamily, fontSize: 12 }, axisLine: { show: false }, axisTick: { show: false }, data: ['Chrome', 'Safari', 'Firefox', 'Edge', 'Other'], inverse: true, type: 'category' },
}))

Chart.registerChart(HOSTS.line, (theme): EChartsOption => ({
  grid: Chart.compactGrid({ bottom: 42 }),
  legend: Chart.shadcnLegend(theme),
  series: [
    { data: DESKTOP, itemStyle: { color: theme.chart1 }, lineStyle: { color: theme.chart1, width: 2 }, name: 'Desktop', showSymbol: false, smooth: 0.35, type: 'line' },
    { data: MOBILE, itemStyle: { color: theme.chart2 }, lineStyle: { color: theme.chart2, width: 2 }, name: 'Mobile', showSymbol: false, smooth: 0.35, type: 'line' },
  ],
  tooltip: Chart.shadcnTooltip(theme),
  xAxis: Chart.categoryAxis(theme, MONTHS),
  yAxis: Chart.valueAxis(theme),
}))

Chart.registerChart(HOSTS.pie, (theme): EChartsOption => ({
  legend: Chart.shadcnLegend(theme),
  series: [{
    center: ['50%', '43%'],
    data: [
      { itemStyle: { color: theme.chart1 }, name: 'Chrome', value: 275 },
      { itemStyle: { color: theme.chart2 }, name: 'Safari', value: 200 },
      { itemStyle: { color: theme.chart3 }, name: 'Firefox', value: 187 },
      { itemStyle: { color: theme.chart4 }, name: 'Edge', value: 173 },
    ],
    label: { show: false },
    radius: ['42%', '68%'],
    type: 'pie',
  }],
  tooltip: Chart.shadcnTooltip(theme, { trigger: 'item' }),
}))

Chart.registerChart(HOSTS.radar, (theme): EChartsOption => ({
  radar: {
    axisName: { color: theme.mutedForeground, fontFamily: theme.fontFamily, fontSize: 11 },
    indicator: [{ max: 100, name: 'Quality' }, { max: 100, name: 'Speed' }, { max: 100, name: 'Reach' }, { max: 100, name: 'Trust' }, { max: 100, name: 'Value' }],
    splitArea: { areaStyle: { color: ['transparent'] } },
    splitLine: { lineStyle: { color: theme.border } },
  },
  series: [{ areaStyle: { color: Chart.colorWithOpacity(theme.chart1, 0.18) }, data: [{ name: 'Current', value: [82, 71, 64, 88, 76] }], itemStyle: { color: theme.chart1 }, lineStyle: { color: theme.chart1, width: 2 }, symbolSize: 5, type: 'radar' }],
  tooltip: Chart.shadcnTooltip(theme, { trigger: 'item' }),
}))

Chart.registerChart(HOSTS.radial, (theme): EChartsOption => ({
  angleAxis: { max: 300, show: false, startAngle: 90, type: 'value' },
  polar: { radius: ['28%', '92%'] },
  radiusAxis: { axisLabel: { show: false }, axisLine: { show: false }, axisTick: { show: false }, data: ['Chrome', 'Safari', 'Firefox', 'Edge'], type: 'category' },
  series: [{ backgroundStyle: { color: Chart.colorWithOpacity(theme.mutedForeground, 0.12) }, barWidth: '62%', coordinateSystem: 'polar', data: [{ itemStyle: { color: theme.chart1 }, value: 275 }, { itemStyle: { color: theme.chart2 }, value: 200 }, { itemStyle: { color: theme.chart3 }, value: 187 }, { itemStyle: { color: theme.chart4 }, value: 173 }], name: 'Visitors', roundCap: true, showBackground: true, type: 'bar' }],
  tooltip: Chart.shadcnTooltip(theme, { trigger: 'item' }),
}))

type ChartSpec = Readonly<{ description: string; hostId: string; size?: Chart.EChartSize; title: string }>

const SPECS: ReadonlyArray<ChartSpec> = [
  { description: 'Smooth line with a semantic token gradient.', hostId: HOSTS.area, title: 'Area chart' },
  { description: 'Two channels accumulated into a shared total.', hostId: HOSTS.areaStacked, title: 'Stacked area' },
  { description: 'Side-by-side comparison across a time axis.', hostId: HOSTS.bar, title: 'Grouped bar' },
  { description: 'Ranked categories with a horizontal reading direction.', hostId: HOSTS.barHorizontal, title: 'Horizontal bar' },
  { description: 'Multiple series with a compact bottom legend.', hostId: HOSTS.line, title: 'Multiple line' },
  { description: 'Proportional browser share with a contained legend.', hostId: HOSTS.pie, size: 'square', title: 'Donut chart' },
  { description: 'Multi-dimensional readiness shown on a common scale.', hostId: HOSTS.radar, size: 'square', title: 'Radar chart' },
  { description: 'Concentric category values in a compact radial form.', hostId: HOSTS.radial, size: 'square', title: 'Radial chart' },
]

const chartCard = (spec: ChartSpec, h: HtmlBuilder<Message>): Html =>
  section({ children: [Chart.eChart({ accessibleAlternative: h.p([], [`${spec.title}: ${spec.description}`]), ariaLabel: `${spec.title}: ${spec.description}`, hostId: spec.hostId, ...(spec.size === undefined ? {} : { size: spec.size }), toMessage: (message) => message }, h)], description: spec.description, heading: spec.title, surface: 'card' }, h)

export const view = (_model: Model, h: HtmlBuilder<Message>): Html =>
  box({
    as: 'main',
    children: [stack({ children: [
      stack({ children: [badge({ children: ['Apache ECharts + StyleX'], variant: 'secondary' }, h), text({ as: 'h1', children: ['Beautiful charts, constrained by design'], variant: 'hero' }, h), text({ as: 'p', children: ['The same Apache ECharts engine as the Tailwind gallery, with StyleX owning every DOM surface, spacing rule, responsive region, and finite host size.'], measure: 'hero', tone: 'secondary' }, h)], gap: 'md' }, h),
      inline({ children: ['Area', 'Bar', 'Line', 'Pie', 'Radar', 'Radial'].map((label) => badge({ children: [label], variant: 'outline' }, h)), gap: 'sm', wrap: true }, h),
      grid({ children: SPECS.map((spec) => chartCard(spec, h)), columns: 'two', gap: 'lg', width: 'full' }, h),
    ], gap: 'xl', padding: 'xl' }, h)],
    data: { page: 'charts-stylex' },
    minHeight: 'createPage',
    surface: 'page',
    width: 'content',
  }, h)
