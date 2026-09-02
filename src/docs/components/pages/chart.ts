import type { EChartsOption } from 'echarts/types/dist/shared';
import { Schema as S } from 'effect';
import type { HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import { authoredPage, definePreviewProgram, foldkitApplication, staticComponentApplication } from '@/docs/components/pages/authored-page';
import * as Chart from '@/ui/chart';
import * as Table from '@/ui/table';

const ECHART_HOST = 'docs-chart-lifecycle';
Chart.registerChart(ECHART_HOST, (theme, variant): EChartsOption => ({
  grid: Chart.compactGrid(),
  series: [{ data: variant === 'quarter' ? [186, 305, 237, 314] : [186, 305, 237, 273, 209, 314], itemStyle: { color: theme.chart2 }, name: 'Revenue', type: 'bar' }],
  tooltip: Chart.shadcnTooltip(theme),
  xAxis: Chart.categoryAxis(theme, variant === 'quarter' ? ['Q1', 'Q2', 'Q3', 'Q4'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], { boundaryGap: true }),
  yAxis: Chart.valueAxis(theme, { showLabels: true }),
}));

const ChangedChartRange = m('ChangedChartRange', { variant: S.Literals(['month', 'quarter']) });
const ChartPreviewMessage = S.Union([Chart.ChartMessage, ChangedChartRange]);
type ChartPreviewMessage = typeof ChartPreviewMessage.Type;
const ChartPreviewModel = S.Struct({ _docsPage: S.Literal('chart'), variant: S.Literals(['month', 'quarter']) });
type ChartPreviewModel = typeof ChartPreviewModel.Type;

const accessibleRevenueTable = <Message>(h: HtmlBuilder<Message>) => Table.table({ children: [
  Table.tableCaption({ children: ['Revenue values shown in the chart.'] }, h),
  Table.tableHeader({ children: [Table.tableRow({ children: [Table.tableHead({ children: ['Period'] }, h), Table.tableHead({ children: ['Revenue'] }, h)] }, h)] }, h),
  Table.tableBody({ children: [['Jan', '$186k'], ['Feb', '$305k'], ['Mar', '$237k']].map(([period, value]) => Table.tableRow({ children: [Table.tableHead({ scope: 'row', children: [period ?? ''] }, h), Table.tableCell({ children: [value ?? ''] }, h)] }, h)) }, h),
] }, h);

const previewProgram = definePreviewProgram<ChartPreviewModel, ChartPreviewMessage>({
  Model: ChartPreviewModel,
  Message: ChartPreviewMessage,
  init: () => ({ _docsPage: 'chart', variant: 'month' }),
  update: (model, message) => {
    switch (message._tag) {
      case 'ChangedChartRange': return [{ ...model, variant: message.variant }, [Chart.SyncChart({ hostId: ECHART_HOST, variant: message.variant })]];
      case 'ChartMounted':
      case 'ChartMountFailed':
      case 'CompletedSyncChart': return [model, []];
    }
  },
  view: (index, model, h) => index === 0
    ? Chart.barChart({ class: 'max-w-xl', data: [{ label: 'Jan', value: 186 }, { label: 'Feb', value: 305 }, { label: 'Mar', value: 237 }, { label: 'Apr', value: 273 }, { label: 'May', value: 209 }, { label: 'Jun', value: 314 }] }, h)
    : index === 1
      ? h.div([h.Class('w-full max-w-xl space-y-4')], [Chart.areaChart({ data: [186, 305, 237, 273, 209, 314] }, h), Chart.chartLegend({ config: { visitors: { label: 'Visitors', color: 'var(--chart-2)' } } }, h)])
      : index === 2 ? h.div([h.Class('w-full max-w-xl space-y-3')], [
          h.button([h.Type('button'), h.OnClick(ChangedChartRange({ variant: model.variant === 'month' ? 'quarter' : 'month' })), h.Class('rounded-md border px-3 py-2 text-sm')], [model.variant === 'month' ? 'Show quarters' : 'Show months']),
          Chart.eChart({ accessibleAlternative: accessibleRevenueTable(h), ariaLabel: 'Revenue by period', hostId: ECHART_HOST, toMessage: message => message, variant: model.variant }, h),
        ]) : h.div([h.Class('grid w-full max-w-xl gap-3')], [
          Chart.eChart({ accessibleAlternative: h.p([], ['Revenue data is loading.']), ariaLabel: 'Loading revenue', hostId: `${ECHART_HOST}-loading`, state: 'loading', toMessage: message => message }, h),
          Chart.eChart({ accessibleAlternative: h.p([], ['No revenue records are available.']), ariaLabel: 'Empty revenue', hostId: `${ECHART_HOST}-empty`, state: 'empty', toMessage: message => message }, h),
          Chart.eChart({ accessibleAlternative: h.p([], ['Revenue service is unavailable.']), ariaLabel: 'Revenue error', hostId: `${ECHART_HOST}-error`, state: 'error', statusText: 'Revenue could not be loaded.', toMessage: message => message }, h),
        ]),
});

const barSource = staticComponentApplication({
  componentName: 'Chart', componentSlug: 'chart', exampleName: 'Monthly revenue',
  viewBody: `Chart.barChart({
  class: 'max-w-xl',
  data: [
    { label: 'Jan', value: 186 },
    { label: 'Feb', value: 305 },
    { label: 'Mar', value: 237 },
    { label: 'Apr', value: 273 },
    { label: 'May', value: 209 },
    { label: 'Jun', value: 314 },
  ],
}, h),`,
});

const areaSource = staticComponentApplication({
  componentName: 'Chart', componentSlug: 'chart', exampleName: 'Traffic trend',
  viewBody: `h.div([h.Class('w-full max-w-xl space-y-4')], [
  Chart.areaChart({ data: [186, 305, 237, 273, 209, 314] }, h),
  Chart.chartLegend({ config: { visitors: { label: 'Visitors', color: 'var(--chart-2)' } } }, h),
]),`,
});

const lifecycleSource = foldkitApplication({
  title: 'Chart — ECharts lifecycle adapter',
  imports: `import type { EChartsOption } from 'echarts/types/dist/shared'
import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Chart from '@/ui/chart'`,
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
    Chart.eChart({
      accessibleAlternative: h.p([], ['Revenue values: January 186, February 305, March 237.']),
      ariaLabel: 'Revenue by period', hostId, toMessage: message => message, variant: model.variant,
    }, h),
  ]),
})`,
});

export const chartPage = authoredPage({
  slug: 'chart', title: 'Chart', kind: 'recipe', previewProgram,
  definition: {
    kind: 'recipe', description: 'Pure SVG chart recipes plus a Foldkit lifecycle adapter for Apache ECharts.',
    architecture: 'Keep serializable chart data and configuration in the parent. Pure SVG helpers render directly; ECharts is acquired by Mount, updated through SyncChart, observed for resize, and disposed when the host leaves the DOM.',
    apiHref: 'https://foldkit.dev/guide/html',
    composition: 'Parent domain Model\n├── serializable data + variant\n├── ECharts Mount resource\n│   ├── ResizeObserver\n│   ├── SyncChart Command\n│   └── disposal finalizer\n└── accessible summary or data table',
    styling: 'Chart colors come from theme tokens. Size the host; the lifecycle adapter resolves tokens when mounted and ECharts handles its canvas.',
    accessibility: 'Every renderer exposes an image role and accessible name. The ECharts adapter requires a summary or data table because canvas tooltips are supplementary and are not the keyboard-accessible data source.',
    examples: [
      { title: 'Monthly revenue', description: 'A responsive bar chart is a pure projection of typed data and needs no update branch.', code: barSource, previewClass: 'justify-stretch' },
      { title: 'Traffic trend', description: 'Area rendering and the shared legend remain separate helpers so the application controls composition.', code: areaSource, previewClass: 'justify-stretch' },
      { title: 'ECharts lifecycle', description: 'Mount owns the imperative chart, resize observer, and cleanup. Parent state selects the variant and SyncChart applies finite updates.', code: lifecycleSource, previewClass: 'justify-stretch' },
      { title: 'Lifecycle states', description: 'Loading, empty, and error states render meaningful HTML without mounting an imperative runtime, so SSR and failure paths remain useful.', code: lifecycleSource, previewClass: 'justify-stretch' },
    ],
  },
});
