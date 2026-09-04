import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication, staticComponentApplication } from '@/docs/components/pages/authored-page';

export const chartHostId = 'docs-chart-lifecycle';
export const chartData = [{ label: 'Jan', value: 186 }, { label: 'Feb', value: 305 }, { label: 'Mar', value: 237 }, { label: 'Apr', value: 273 }, { label: 'May', value: 209 }, { label: 'Jun', value: 314 }] as const;
export const chartFixtures = [
  { title: 'Monthly revenue', description: 'A responsive bar chart is a pure projection of typed data and needs no update branch.', kind: 'bar' },
  { title: 'Traffic trend', description: 'Area rendering and the shared legend remain separate helpers so the application controls composition.', kind: 'area' },
  { title: 'ECharts lifecycle', description: 'Mount owns the imperative chart, resize observer, and cleanup. Parent state selects the variant and SyncChart applies finite updates.', kind: 'lifecycle' },
  { title: 'Lifecycle states', description: 'Loading, empty, and error states render meaningful HTML without mounting an imperative runtime, so SSR and failure paths remain useful.', kind: 'states' },
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

const staticSource = (kind: 'bar' | 'area', renderer: 'tailwind' | 'stylex'): string => staticComponentApplication({
  componentName: 'Chart', componentSlug: 'chart', renderer, exampleName: kind === 'bar' ? 'Monthly revenue' : 'Traffic trend',
  ...(renderer === 'stylex' ? { componentImports: "import * as stylex from '@stylexjs/stylex'\nconst styles = stylex.create({ chart: { maxWidth: '36rem' }, stack: { width: '100%', maxWidth: '36rem' } })" } : {}),
  viewBody: kind === 'bar' ? `Chart.barChart({ ${renderer === 'stylex' ? 'layoutStyle: styles.chart' : "class: 'max-w-xl'"}, data: [{ label: 'Jan', value: 186 }, { label: 'Feb', value: 305 }, { label: 'Mar', value: 237 }, { label: 'Apr', value: 273 }, { label: 'May', value: 209 }, { label: 'Jun', value: 314 }] }, h)` : `${renderer === 'stylex' ? "h.div([h.Class(stylex.props(styles.stack).className ?? '')]" : "h.div([h.Class('w-full max-w-xl space-y-4')]"}, [Chart.areaChart({ data: [186, 305, 237, 273, 209, 314] }, h), Chart.chartLegend({ config: { visitors: { label: 'Visitors', color: 'var(--chart-2)' } } }, h)])`,
});

export const chartExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => chartFixtures.map(fixture => ({ title: fixture.title, description: fixture.description, previewClass: 'justify-stretch', code: fixture.kind === 'bar' || fixture.kind === 'area' ? staticSource(fixture.kind, renderer) : lifecycleSource(renderer) }));
