import type { EChartsOption } from 'echarts/types/dist/shared';

import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication, staticComponentApplication } from '@/docs/components/pages/authored-page';
import * as ECharts from '@/lib/echarts';

export const chartHostId = 'docs-chart-lifecycle';
export const chartData = [{ label: 'Jan', value: 186 }, { label: 'Feb', value: 305 }, { label: 'Mar', value: 237 }, { label: 'Apr', value: 273 }, { label: 'May', value: 209 }, { label: 'Jun', value: 314 }] as const;

export const chartFamilyKinds = ['area', 'bar', 'line', 'pie', 'radar', 'radial'] as const;
export type ChartFamilyKind = (typeof chartFamilyKinds)[number];
export const chartFamilyHostId = (kind: ChartFamilyKind): string => `docs-chart-family-${kind}`;
export const isChartFamilyKind = (kind: string): kind is ChartFamilyKind => chartFamilyKinds.some(candidate => candidate === kind);

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] as const;
const desktop = [186, 305, 237, 273, 209, 314] as const;
const mobile = [80, 200, 120, 190, 130, 140] as const;

export const chartFamilyOption = (kind: ChartFamilyKind, theme: ECharts.ChartTheme): EChartsOption => {
  switch (kind) {
    case 'area': return {
      grid: ECharts.compactGrid(),
      series: [{ areaStyle: { color: ECharts.areaGradient(theme.chart1) }, data: desktop, itemStyle: { color: theme.chart1 }, lineStyle: { color: theme.chart1, width: 2 }, name: 'Desktop', showSymbol: false, smooth: 0.35, type: 'line' }],
      tooltip: ECharts.shadcnTooltip(theme), xAxis: ECharts.categoryAxis(theme, labels), yAxis: ECharts.valueAxis(theme),
    } as EChartsOption;
    case 'bar': return {
      grid: ECharts.compactGrid({ bottom: 28 }),
      series: [{ data: desktop, itemStyle: { borderRadius: 4, color: theme.chart2 }, name: 'Desktop', type: 'bar' }],
      tooltip: ECharts.shadcnTooltip(theme), xAxis: ECharts.categoryAxis(theme, labels, { boundaryGap: true }), yAxis: ECharts.valueAxis(theme),
    } as EChartsOption;
    case 'line': return {
      grid: ECharts.compactGrid({ bottom: 42 }), legend: ECharts.shadcnLegend(theme),
      series: [
        { data: desktop, itemStyle: { color: theme.chart1 }, lineStyle: { color: theme.chart1, width: 2 }, name: 'Desktop', showSymbol: false, smooth: 0.35, type: 'line' },
        { data: mobile, itemStyle: { color: theme.chart2 }, lineStyle: { color: theme.chart2, width: 2 }, name: 'Mobile', showSymbol: false, smooth: 0.35, type: 'line' },
      ],
      tooltip: ECharts.shadcnTooltip(theme), xAxis: ECharts.categoryAxis(theme, labels), yAxis: ECharts.valueAxis(theme),
    } as EChartsOption;
    case 'pie': return {
      legend: ECharts.shadcnLegend(theme),
      series: [{ data: [{ itemStyle: { color: theme.chart1 }, name: 'Chrome', value: 275 }, { itemStyle: { color: theme.chart2 }, name: 'Safari', value: 200 }, { itemStyle: { color: theme.chart3 }, name: 'Firefox', value: 187 }, { itemStyle: { color: theme.chart4 }, name: 'Edge', value: 173 }], label: { color: theme.foreground }, radius: ['44%', '70%'], type: 'pie' }],
      tooltip: ECharts.shadcnTooltip(theme, { trigger: 'item' }),
    } as EChartsOption;
    case 'radar': return {
      radar: { axisLine: { lineStyle: { color: theme.border } }, axisName: { color: theme.mutedForeground, fontFamily: theme.fontFamily, fontSize: 11 }, indicator: ['Speed', 'Quality', 'Coverage', 'Reliability', 'DX'].map(name => ({ max: 100, name })), splitArea: { areaStyle: { color: ['transparent'] } }, splitLine: { lineStyle: { color: theme.border } } },
      series: [{ areaStyle: { color: ECharts.colorWithOpacity(theme.chart1, 0.18) }, data: [{ name: 'Score', value: [82, 91, 76, 88, 84] }], itemStyle: { color: theme.chart1 }, lineStyle: { color: theme.chart1, width: 2 }, type: 'radar' }],
      tooltip: ECharts.shadcnTooltip(theme, { trigger: 'item' }),
    } as EChartsOption;
    case 'radial': return {
      angleAxis: { max: 400, startAngle: 90, type: 'value' }, polar: { radius: ['24%', '88%'] },
      radiusAxis: { axisLine: { show: false }, axisTick: { show: false }, data: ['Search', 'Direct', 'Social', 'Email'], type: 'category' },
      series: [{ backgroundStyle: { color: ECharts.colorWithOpacity(theme.mutedForeground, 0.12) }, barWidth: '58%', coordinateSystem: 'polar', data: [275, 220, 187, 140].map((value, index) => ({ itemStyle: { color: [theme.chart1, theme.chart2, theme.chart3, theme.chart4][index] }, value })), name: 'Visitors', roundCap: true, showBackground: true, type: 'bar' }],
      tooltip: ECharts.shadcnTooltip(theme, { trigger: 'item' }),
    } as EChartsOption;
  }
};

export const chartFixtures = [
  { title: 'Monthly revenue', description: 'A responsive bar chart is a pure SVG projection of typed data and needs no update branch.', kind: 'bar-svg' },
  { title: 'Traffic trend', description: 'Pure SVG area rendering and the shared legend remain separate helpers so the application controls composition.', kind: 'area-svg' },
  { title: 'ECharts lifecycle', description: 'Mount owns the imperative chart, resize observer, and cleanup. Parent state selects the variant and SyncChart applies finite updates.', kind: 'lifecycle' },
  { title: 'Lifecycle states', description: 'Loading, empty, and error states render meaningful HTML without mounting an imperative runtime, so SSR and failure paths remain useful.', kind: 'states' },
  { title: 'Area chart', description: 'Show change over time while emphasizing the magnitude beneath a continuous series.', kind: 'area' },
  { title: 'Bar chart', description: 'Compare discrete values across periods or categories with a shared quantitative baseline.', kind: 'bar' },
  { title: 'Line chart', description: 'Compare multiple continuous series and expose their values through a themed tooltip and legend.', kind: 'line' },
  { title: 'Pie chart', description: 'Show a compact part-to-whole relationship when the category count stays intentionally small.', kind: 'pie' },
  { title: 'Radar chart', description: 'Compare several dimensions on a shared scale when the overall profile matters more than exact values.', kind: 'radar' },
  { title: 'Radial chart', description: 'Use polar bars for a compact category comparison where direction is not part of the data.', kind: 'radial' },
] as const;

const lifecycleSource = (renderer: 'tailwind' | 'stylex'): string => foldkitApplication({
  title: 'Chart — ECharts lifecycle adapter',
  imports: `import type { EChartsOption } from 'echarts/types/dist/shared'
import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Chart from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/chart'`,
  model: `export const Model = S.Struct({ variant: S.Literals(['month', 'quarter']) })
export type Model = typeof Model.Type

const hostId = 'revenue-chart'
Chart.registerChart(hostId, (theme, variant): EChartsOption => ({
  grid: Chart.compactGrid(),
  series: [{ data: variant === 'quarter' ? [186, 305, 237, 314] : [186, 305, 237, 273, 209, 314], itemStyle: { color: theme.chart2 }, name: 'Revenue', type: 'bar' }],
  tooltip: Chart.shadcnTooltip(theme),
  xAxis: Chart.categoryAxis(theme, variant === 'quarter' ? ['Q1', 'Q2', 'Q3', 'Q4'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], { boundaryGap: true }),
  yAxis: Chart.valueAxis(theme, { showLabels: true }),
}))`,
  messages: `export const ChangedRange = m('ChangedRange', { variant: S.Literals(['month', 'quarter']) })
export const Message = S.Union([Chart.ChartMessage, ChangedRange])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [{ variant: 'month' }, []]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'ChangedRange': return [{ variant: message.variant }, [Chart.SyncChart({ hostId, variant: message.variant })]]
    case 'ChartMounted':
    case 'ChartMountFailed':
    case 'CompletedSyncChart': return [model, []]
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Revenue chart',
  body: h.main([], [
    h.button([h.Type('button'), h.OnClick(ChangedRange({ variant: model.variant === 'month' ? 'quarter' : 'month' }))], ['Change range']),
    Chart.eChart({ accessibleAlternative: h.p([], ['Revenue values: January 186, February 305, March 237.']), ariaLabel: 'Revenue by period', hostId, toMessage: message => message, variant: model.variant }, h),
  ]),
})`,
});

const staticSource = (kind: 'bar-svg' | 'area-svg', renderer: 'tailwind' | 'stylex'): string => staticComponentApplication({
  componentName: 'Chart', componentSlug: 'chart', renderer, exampleName: kind === 'bar-svg' ? 'Monthly revenue' : 'Traffic trend',
  ...(renderer === 'stylex' ? { componentImports: "import * as stylex from '@stylexjs/stylex'\nconst styles = stylex.create({ chart: { maxWidth: '36rem' }, stack: { width: '100%', maxWidth: '36rem' } })" } : {}),
  viewBody: kind === 'bar-svg' ? `Chart.barChart({ ${renderer === 'stylex' ? 'layoutStyle: styles.chart' : "class: 'max-w-xl'"}, data: [{ label: 'Jan', value: 186 }, { label: 'Feb', value: 305 }, { label: 'Mar', value: 237 }, { label: 'Apr', value: 273 }, { label: 'May', value: 209 }, { label: 'Jun', value: 314 }] }, h)` : `${renderer === 'stylex' ? "h.div([h.Class(stylex.props(styles.stack).className ?? '')]" : "h.div([h.Class('w-full max-w-xl space-y-4')]"}, [Chart.areaChart({ data: [186, 305, 237, 273, 209, 314] }, h), Chart.chartLegend({ config: { visitors: { label: 'Visitors', color: 'var(--chart-2)' } } }, h)])`,
});

const familyRegistration = (kind: ChartFamilyKind): string => {
  switch (kind) {
    case 'area': return `grid: Chart.compactGrid(),\n  series: [{ areaStyle: { color: Chart.areaGradient(theme.chart1) }, data: [186, 305, 237, 273, 209, 314], itemStyle: { color: theme.chart1 }, lineStyle: { color: theme.chart1, width: 2 }, name: 'Desktop', showSymbol: false, smooth: 0.35, type: 'line' }],\n  tooltip: Chart.shadcnTooltip(theme),\n  xAxis: Chart.categoryAxis(theme, labels),\n  yAxis: Chart.valueAxis(theme)`;
    case 'bar': return `grid: Chart.compactGrid(),\n  series: [{ data: [186, 305, 237, 273, 209, 314], itemStyle: { borderRadius: 4, color: theme.chart2 }, name: 'Desktop', type: 'bar' }],\n  tooltip: Chart.shadcnTooltip(theme),\n  xAxis: Chart.categoryAxis(theme, labels, { boundaryGap: true }),\n  yAxis: Chart.valueAxis(theme)`;
    case 'line': return `grid: Chart.compactGrid({ bottom: 42 }),\n  legend: Chart.shadcnLegend(theme),\n  series: [{ data: [186, 305, 237, 273, 209, 314], itemStyle: { color: theme.chart1 }, lineStyle: { color: theme.chart1, width: 2 }, name: 'Desktop', type: 'line' }, { data: [80, 200, 120, 190, 130, 140], itemStyle: { color: theme.chart2 }, lineStyle: { color: theme.chart2, width: 2 }, name: 'Mobile', type: 'line' }],\n  tooltip: Chart.shadcnTooltip(theme),\n  xAxis: Chart.categoryAxis(theme, labels),\n  yAxis: Chart.valueAxis(theme)`;
    case 'pie': return `legend: Chart.shadcnLegend(theme),\n  series: [{ data: [{ name: 'Chrome', value: 275 }, { name: 'Safari', value: 200 }, { name: 'Firefox', value: 187 }], radius: ['44%', '70%'], type: 'pie' }],\n  tooltip: Chart.shadcnTooltip(theme, { trigger: 'item' })`;
    case 'radar': return `radar: { indicator: ['Speed', 'Quality', 'Coverage', 'Reliability', 'DX'].map(name => ({ max: 100, name })) },\n  series: [{ data: [{ name: 'Score', value: [82, 91, 76, 88, 84] }], itemStyle: { color: theme.chart1 }, type: 'radar' }],\n  tooltip: Chart.shadcnTooltip(theme, { trigger: 'item' })`;
    case 'radial': return `angleAxis: { max: 400, startAngle: 90, type: 'value' },\n  polar: { radius: ['24%', '88%'] },\n  radiusAxis: { data: ['Search', 'Direct', 'Social', 'Email'], type: 'category' },\n  series: [{ coordinateSystem: 'polar', data: [275, 220, 187, 140], roundCap: true, type: 'bar' }],\n  tooltip: Chart.shadcnTooltip(theme, { trigger: 'item' })`;
  }
};

const familySource = (kind: ChartFamilyKind, renderer: 'tailwind' | 'stylex'): string => foldkitApplication({
  title: `Chart — ${kind} chart`,
  imports: `import type { EChartsOption } from 'echarts/types/dist/shared'
import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'

import * as Chart from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/chart'`,
  model: `export const Model = S.Struct({})
export type Model = typeof Model.Type

const hostId = '${chartFamilyHostId(kind)}'
const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
Chart.registerChart(hostId, (theme): EChartsOption => ({
  ${familyRegistration(kind)},
}))`,
  messages: `export const Message = Chart.ChartMessage
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [{}, []]`,
  update: `export const update = (model: Model, _message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [model, []]`,
  view: `export const view = (_model: Model, h: HtmlBuilder<Message>): Document => ({
  title: '${kind[0]?.toUpperCase() ?? ''}${kind.slice(1)} chart',
  body: h.main([], [Chart.eChart({ accessibleAlternative: h.p([], ['${kind} chart showing the documented values.']), ariaLabel: '${kind} chart example', hostId, toMessage: message => message }, h)]),
})`,
});

export const chartExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => chartFixtures.map(fixture => ({
  title: fixture.title, description: fixture.description, previewClass: 'justify-stretch',
  code: fixture.kind === 'bar-svg' || fixture.kind === 'area-svg'
    ? staticSource(fixture.kind, renderer)
    : fixture.kind === 'lifecycle' || fixture.kind === 'states'
      ? lifecycleSource(renderer)
      : familySource(fixture.kind, renderer),
}));
