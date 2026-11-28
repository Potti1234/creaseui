import { Html } from '@effect/ui/html'

import {
  AreaChart,
  Card,
  BarChart,
  ChartContainer,
  ChartLegend,
  ChartTooltipContent,
  DonutChart,
  EChart,
  InteractiveAreaChart,
} from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  DocsMessage,
} from '../types'
import {
  familyHostId,
  upstreamHostId,
  type ChartFamilyKind,
  type ChartUpstreamKind,
} from './chart-echarts'
import { exampleApplicationSource } from './source'

const monthly = [
  { label: 'Jan', value: 12 },
  { label: 'Feb', value: 18 },
  { label: 'Mar', value: 15 },
  { label: 'Apr', value: 24 },
  { label: 'May', value: 21 },
  { label: 'Jun', value: 31 },
]
const revenueData = [
  { label: 'Jan', value: 186 },
  { label: 'Feb', value: 305 },
  { label: 'Mar', value: 237 },
  { label: 'Apr', value: 273 },
  { label: 'May', value: 209 },
  { label: 'Jun', value: 314 },
] as const
const trend = Array.from({ length: 18 }, (_, index) => ({
  label: `Day ${index + 1}`,
  desktop: 12 + Math.round(Math.sin(index / 2) * 7 + index * 1.4),
  mobile: 8 + Math.round(Math.cos(index / 2) * 5 + index),
}))
const config = {
  revenue: { label: 'Revenue', color: 'var(--primary)' },
  traffic: { label: 'Traffic', color: 'var(--chart-2, #60a5fa)' },
}
const wrap = (child: unknown): any => child
const echart =
  (
    kind: ChartUpstreamKind | ChartFamilyKind,
    label: string,
    variant?: string,
    state?: 'ready' | 'loading' | 'empty' | 'error',
  ): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>) => {
    const family = ['area', 'bar', 'line', 'pie', 'radar', 'radial'].includes(
      kind,
    )
    return EChart(h, {
      hostId: family
        ? familyHostId(kind as ChartFamilyKind)
        : upstreamHostId(kind as ChartUpstreamKind),
      ariaLabel: label,
      accessibleAlternative: h.p.children(
        'Chart data is available in the surrounding documentation example source.',
      ),
      toMessage: () => DocsMessage.ChartEvent(),
      ...(variant === undefined ? {} : { variant }),
      ...(state === undefined ? {} : { state }),
    })
  }
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) => {
    const upstream: Record<string, [ChartUpstreamKind, string, string?]> = {
      demo: ['demo', 'Interactive monthly traffic chart'],
      first1: ['step-basic', 'Minimal two-series bar chart'],
      first2: ['step-grid', 'Bar chart with grid'],
      first3: ['step-axis', 'Bar chart with category axis'],
      first4: ['step-tooltip', 'Bar chart with tooltip'],
      first5: ['step-legend', 'Bar chart with legend'],
      rtl: ['rtl', 'Right-to-left bar chart'],
      lifecycle: ['lifecycle', 'Revenue by period'],
    }
    const selected = upstream[kind]
    if (kind === 'lifecycle')
      return h.div
        .class('mx-auto w-full max-w-xl space-y-3')
        .children(
          h.button
            .class('rounded-md border px-3 py-2 text-sm')
            .attrs({ type: 'button' })
            .children('Show quarters'),
          echart('lifecycle', 'Revenue by period')(h, context),
        )
    if (kind === 'demo')
      return Card(h, {
        className: 'mx-auto w-full max-w-xl',
        children: card => [
          card.header({
            children: [
              h.div
                .class(
                  'flex flex-col items-stretch sm:flex-row sm:items-center',
                )
                .children(
                  h.div
                    .class('flex flex-1 flex-col justify-center gap-1')
                    .children(
                      card.title({ children: ['Bar Chart - Interactive'] }),
                      card.description({
                        children: [
                          'Showing total visitors for the last 3 months',
                        ],
                      }),
                    ),
                  h.div.class('flex').children(
                    [
                      ['desktop', 'Desktop', '7,324', true],
                      ['mobile', 'Mobile', '7,250', false],
                    ].map(([key, label, total, active]) =>
                      h.button
                        .key(String(key))
                        .attrs({
                          type: 'button',
                          'data-active': active === true ? 'true' : 'false',
                        })
                        .class(
                          'flex flex-1 flex-col justify-center gap-1 border-t px-4 py-3 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l',
                        )
                        .children(
                          h.span
                            .class('text-xs text-muted-foreground')
                            .children(String(label)),
                          h.span
                            .class('text-lg leading-none font-bold')
                            .children(String(total)),
                        ),
                    ),
                  ),
                ),
            ],
          }),
          card.content({
            children: [
              h.div
                .class('h-64 w-full')
                .children(
                  echart(
                    'demo',
                    'Bar chart of daily page views',
                    'desktop',
                  )(h, context) as never,
                ),
            ],
          }),
        ],
      })
    if (selected !== undefined)
      return h.div
        .class('mx-auto w-full max-w-xl')
        .attrs(kind === 'rtl' ? { dir: 'rtl' } : {})
        .children(echart(selected[0], selected[1], selected[2])(h, context))
    if (kind === 'states')
      return h.div
        .class('mx-auto grid w-full max-w-xl gap-3')
        .children(
          echart(
            'lifecycle',
            'Loading revenue chart',
            undefined,
            'loading',
          )(h, context),
          echart(
            'lifecycle',
            'Empty revenue chart',
            undefined,
            'empty',
          )(h, context),
          echart(
            'lifecycle',
            'Failed revenue chart',
            undefined,
            'error',
          )(h, context),
        )
    if (['area', 'bar', 'line', 'pie', 'radar', 'radial'].includes(kind))
      return h.div
        .class('mx-auto w-full max-w-xl')
        .children(echart(kind as ChartFamilyKind, `${kind} chart`)(h, context))
    if (kind === 'tooltip')
      return h.div.class('flex flex-wrap gap-4').children(
        ChartTooltipContent(h, {
          config: {
            desktop: { label: 'Desktop', color: 'var(--chart-3)' },
          },
          label: 'Page Views',
          items: [{ key: 'desktop', value: '12,486' }],
        }) as never,
        ChartTooltipContent(h, {
          config: {
            chrome: { label: 'Chrome', color: 'var(--chart-3)' },
            firefox: { label: 'Firefox', color: 'var(--chart-4)' },
          },
          label: 'Browser',
          items: [
            { key: 'chrome', value: '1,286' },
            { key: 'firefox', value: '1,000' },
          ],
        }) as never,
        ChartTooltipContent(h, {
          config: {
            chrome: { label: 'Chrome', color: 'var(--chart-1)' },
          },
          items: [{ key: 'chrome', value: '1,286' }],
        }) as never,
      )
    if (kind === 'rtl')
      return h.div.attrs({ dir: 'rtl' }).children(
        AreaChart(h, {
          id: `${context.idPrefix}-${kind}`,
          data: monthly.map(d => d.value),
          ariaLabel: 'الاتجاه الشهري',
        }) as never,
      )
    if (kind === 'revenue')
      return BarChart(h, {
        className: 'mx-auto max-w-xl',
        data: revenueData,
        ariaLabel: 'Monthly revenue',
      }) as never
    if (kind === 'traffic')
      return h.div.class('mx-auto w-full max-w-xl space-y-4').children(
        AreaChart(h, {
          id: `${context.idPrefix}-${kind}`,
          data: revenueData.map(item => item.value),
          ariaLabel: 'Traffic trend',
        }) as never,
        ChartLegend(h, {
          config: {
            visitors: { label: 'Visitors', color: 'var(--chart-2)' },
          },
        }) as never,
      )
    if (kind === 'loading')
      return h.div
        .class(
          'flex aspect-video w-full items-center justify-center rounded-md border text-sm text-muted-foreground',
        )
        .attrs({ role: 'status' })
        .children('Loading chart…')
    if (kind === 'area')
      return AreaChart(h, {
        id: `${context.idPrefix}-${kind}`,
        data: monthly.map(d => d.value),
        ariaLabel: 'Area chart',
      }) as never
    if (kind === 'bar')
      return BarChart(h, { data: monthly, ariaLabel: 'Bar chart' }) as never
    if (kind === 'line')
      return InteractiveAreaChart(h, {
        id: `${context.idPrefix}-${kind}`,
        data: trend,
        ariaLabel: 'Line chart',
      }) as never
    if (kind === 'pie')
      return DonutChart(h, {
        value: 68,
        max: 100,
        label: '68%',
        sublabel: 'Completed',
        ariaLabel: 'Pie chart',
      } as any) as never
    if (kind === 'radar' || kind === 'radial')
      return DonutChart(h, {
        value: 42,
        max: 100,
        label: '42%',
        sublabel: kind === 'radar' ? 'Radar' : 'Radial',
        ariaLabel: `${kind} chart`,
      } as any) as never
    return h.div.class('grid w-full gap-3').children(
      ChartContainer(h, {
        config,
        ariaLabel: kind === 'traffic' ? 'Traffic trend' : 'Monthly revenue',
        children: [
          kind === 'traffic'
            ? (InteractiveAreaChart(h, {
                id: `${context.idPrefix}-${kind}`,
                data: trend,
                ariaLabel: 'Traffic trend',
              }) as never)
            : (BarChart(h, {
                data: monthly,
                ariaLabel: 'Monthly revenue',
              }) as never),
        ],
      }) as never,
      ChartLegend(h, { config, series: ['revenue', 'traffic'] }) as never,
    )
  }
const source = exampleApplicationSource({
  imports: `import { BarChart, ChartContainer, ChartLegend } from '@/ui/effect/ui'`,
  body: `ChartContainer(h, {
  config,
  children: [BarChart(h, { data, ariaLabel: 'Monthly revenue' })],
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { BarChart, ChartContainer } from '@/ui/effect/ui'\n\nChartContainer(h, { config, children })`,
  examples: [
    { title: 'Demo', view: view('demo'), source },
    { title: 'Your First Chart', view: view('first1'), source },
    { title: 'Your First Chart', view: view('first2'), source },
    { title: 'Your First Chart', view: view('first3'), source },
    { title: 'Your First Chart', view: view('first4'), source },
    { title: 'Your First Chart', view: view('first5'), source },
    { title: 'Tooltip', view: view('tooltip'), source },
    { title: 'RTL', view: view('rtl'), source },
    { title: 'Monthly revenue', view: view('revenue'), source },
    { title: 'Traffic trend', view: view('traffic'), source },
    { title: 'ECharts lifecycle', view: view('lifecycle'), source },
    { title: 'Lifecycle states', view: view('states'), source },
    { title: 'Area chart', view: view('area'), source },
    { title: 'Bar chart', view: view('bar'), source },
    { title: 'Line chart', view: view('line'), source },
    { title: 'Pie chart', view: view('pie'), source },
    { title: 'Radar chart', view: view('radar'), source },
    { title: 'Radial chart', view: view('radial'), source },
  ],
})
