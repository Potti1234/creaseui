import { Mount, type View } from '@effect/ui'
import { Html } from '@effect/ui/html'

import {
  ChartIds,
  MountChart,
  chartAreaPath,
  finite,
  smoothChartPath,
  type ChartMessage,
} from '../behaviors/chart'

export {
  areaGradient,
  categoryAxis,
  ChartMessage,
  colorWithOpacity,
  compactGrid,
  legendOptions,
  registerChart,
  resample,
  shadcnLegend,
  shadcnTooltip,
  slotIds,
  SyncChart,
  tooltipOptions,
  updateAnimation,
  valueAxis,
  type ChartTheme,
  type OptionBuilder,
} from '../behaviors/chart'

export const chartClasses = {
  region: 'w-full',
  host: 'aspect-video w-full',
  status:
    'flex aspect-video w-full items-center justify-center text-sm text-muted-foreground',
  alternative: 'mt-3',
  hiddenAlternative: 'sr-only',
  container: 'flex aspect-video justify-center text-xs',
  legend: 'flex flex-wrap items-center justify-center gap-4',
  legendItem: 'flex items-center gap-1.5',
  marker: 'size-2 shrink-0 rounded-[2px]',
  tooltip:
    'grid min-w-32 gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl',
  tooltipLabel: 'font-medium',
  tooltipRow: 'flex items-center gap-2',
  tooltipName: 'text-muted-foreground',
  tooltipValue: 'ms-auto font-mono font-medium tabular-nums text-foreground',
  chart: 'h-auto w-full',
  interactiveArea: 'block h-auto min-h-60 w-full',
  donut: 'mx-auto aspect-square h-auto w-full',
}
export type ChartClasses = typeof chartClasses

export type ChartProps<Msg, R = never> = {
  readonly hostId: string
  readonly ariaLabel: string
  readonly accessibleAlternative: View.Input<Msg, R>
  readonly toMessage: (message: ChartMessage) => Msg
  readonly variant?: string
  readonly state?: 'ready' | 'loading' | 'empty' | 'error'
  readonly statusText?: string
  readonly className?: string
  readonly dataSize?: string
}

const statuses = {
  ready: '',
  loading: 'Loading chart…',
  empty: 'No chart data available.',
  error: 'Chart could not be loaded.',
} as const

export const EChart = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    hostId,
    ariaLabel,
    accessibleAlternative,
    toMessage,
    variant = '',
    state = 'ready',
    statusText = statuses[state],
    className,
    dataSize,
  }: ChartProps<NoInfer<Msg>, R>,
  styles: ChartClasses = chartClasses,
) =>
  h.div
    .class(styles.region, className)
    .attr('data-slot', 'echart-region')
    .children(
      state === 'ready'
        ? h.div
            .key(hostId)
            .class(styles.host)
            .attrs({
              'data-slot': 'echart',
              'data-size': dataSize,
              role: 'img',
              'aria-label': ariaLabel,
            })
            .onMount(Mount.map(MountChart({ hostId, variant }), toMessage))
        : h.p
            .class(styles.status)
            .attrs({
              'data-slot': `echart-${state}`,
              role: state === 'error' ? 'alert' : 'status',
              'aria-busy': state === 'loading' ? 'true' : undefined,
            })
            .children(statusText),
      h.div
        .class(
          state === 'ready' ? styles.hiddenAlternative : styles.alternative,
        )
        .attr('data-slot', 'echart-accessible-alternative')
        .children(accessibleAlternative),
    )

export type ChartSeriesConfig<Msg = never, R = never> = {
  readonly label?: View.Input<Msg, R>
  readonly color?: string
  readonly icon?: View.Input<Msg, R>
}
export type ChartConfig<Msg = never, R = never> = Readonly<
  Record<string, ChartSeriesConfig<Msg, R>>
>
type Styled = { readonly className?: string }

const colorVariables = <Msg, R>(config: ChartConfig<Msg, R>): Html.Style =>
  Object.fromEntries(
    Object.entries(config).flatMap(([key, { color }]) =>
      color === undefined || !/^[a-zA-Z0-9_-]+$/.test(key)
        ? []
        : [[`--color-${key}`, color]],
    ),
  )

export const ChartContainer = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    config,
    children,
    className,
    ariaLabel = 'Chart',
  }: Styled & {
    readonly config: ChartConfig<NoInfer<Msg>, R>
    readonly children: View.Children<NoInfer<Msg>, R>
    readonly ariaLabel?: string
  },
  styles: ChartClasses = chartClasses,
) =>
  h.div
    .class(styles.container, className)
    .attrs({
      'data-slot': 'chart',
      'data-chart-container': '',
      role: 'img',
      'aria-label': ariaLabel,
    })
    .style(colorVariables(config))
    .children(children)

export const ChartLegend = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    config,
    series,
    className,
  }: Styled & {
    readonly config: ChartConfig<NoInfer<Msg>, R>
    readonly series?: readonly string[]
  },
  styles: ChartClasses = chartClasses,
) =>
  h.div
    .class(styles.legend, className)
    .attr('data-slot', 'chart-legend')
    .style(colorVariables(config))
    .children(
      (series ?? Object.keys(config)).map(key => {
        const item = Object.hasOwn(config, key) ? config[key] : undefined
        return item === undefined
          ? undefined
          : h.div
              .key(key)
              .class(styles.legendItem)
              .children(
                item.icon ??
                  h.span
                    .class(styles.marker)
                    .attr('aria-hidden', 'true')
                    .style({ backgroundColor: item.color }),
                item.label ?? key,
              )
      }),
    )

export const ChartTooltipContent = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    config,
    label,
    items,
    className,
  }: Styled & {
    readonly config: ChartConfig<NoInfer<Msg>, R>
    readonly label?: View.Input<NoInfer<Msg>, R>
    readonly items: readonly {
      readonly key: string
      readonly value: View.Input<NoInfer<Msg>, R>
    }[]
  },
  styles: ChartClasses = chartClasses,
) =>
  h.div
    .class(styles.tooltip, className)
    .attr('data-slot', 'chart-tooltip')
    .style(colorVariables(config))
    .children(
      label === undefined
        ? undefined
        : h.div.class(styles.tooltipLabel).children(label),
      items.map(({ key, value }, index) => {
        const item = Object.hasOwn(config, key) ? config[key] : undefined
        return h.div
          .key(String(index))
          .class(styles.tooltipRow)
          .children(
            h.span
              .class(styles.marker)
              .attr('aria-hidden', 'true')
              .style({ backgroundColor: item?.color }),
            h.span.class(styles.tooltipName).children(item?.label ?? key),
            h.span.class(styles.tooltipValue).children(value),
          )
      }),
    )

const svg = <Msg>(
  h: Html.H<Msg>,
  viewBox: string,
  ariaLabel: string,
  className: string,
  slot = 'chart',
) =>
  h.el('svg').attrs({
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox,
    role: 'img',
    'aria-label': ariaLabel,
    class: className,
    'data-slot': slot,
  })

const caption = <Msg>(
  h: Html.H<Msg>,
  value: string,
  x: number,
  y: number,
  size: number,
  anchor = 'middle',
) =>
  h
    .el('text')
    .attrs({
      x: String(x),
      y: String(y),
      'text-anchor': anchor,
      fill: 'var(--muted-foreground)',
      'font-size': String(size),
    })
    .children(value)

const baseline = <Msg>(
  h: Html.H<Msg>,
  x1: number,
  x2: number,
  y: number,
  size = '0.5',
  dash = '2 2',
) =>
  h.el('line').attrs({
    x1: String(x1),
    x2: String(x2),
    y1: String(y),
    y2: String(y),
    stroke: 'var(--border)',
    'stroke-width': size,
    'stroke-dasharray': dash,
  })

const gradient = <Msg>(
  h: Html.H<Msg>,
  id: string,
  color: string,
  opacity: string,
) =>
  h
    .el('linearGradient')
    .attrs({ id, x1: '0', y1: '0', x2: '0', y2: '1' })
    .children(
      h
        .el('stop')
        .attrs({ offset: '0%', 'stop-color': color, 'stop-opacity': opacity }),
      h
        .el('stop')
        .attrs({ offset: '100%', 'stop-color': color, 'stop-opacity': '0.02' }),
    )

const curve = <Msg>(h: Html.H<Msg>, d: string, color: string, width: string) =>
  h.el('path').attrs({
    d,
    fill: 'none',
    stroke: color,
    'stroke-width': width,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'vector-effect': 'non-scaling-stroke',
  })

export type BarChartDatum = Readonly<{ label: string; value: number }>
export type BarChartProps = Styled & {
  readonly data: readonly BarChartDatum[]
  readonly ariaLabel?: string
  readonly showXAxisLabels?: boolean
  readonly isCompact?: boolean
}

export const BarChart = <Msg>(
  h: Html.H<Msg>,
  {
    data,
    className,
    ariaLabel = 'Bar chart',
    showXAxisLabels = true,
    isCompact = false,
  }: BarChartProps,
  styles: ChartClasses = chartClasses,
) => {
  const width = isCompact ? 320 : 100
  const height = isCompact ? 80 : 60
  const bottom = isCompact ? 58 : showXAxisLabels ? 48 : 56
  const plotHeight = isCompact ? 48 : bottom - 4
  const slot = width / Math.max(1, data.length)
  const barWidth = Math.max(0.5, Math.min(isCompact ? 16 : 10, slot * 0.64))
  const max = data.reduce((max, item) => Math.max(max, finite(item.value)), 0)
  return svg(
    h,
    `0 0 ${width} ${height}`,
    ariaLabel,
    Html.classNames(styles.chart, className),
  ).children(
    data.map(({ value }, index) => {
      const bar =
        max === 0 ? 0 : (Math.max(0, finite(value)) / max) * plotHeight
      const x = index * slot + (slot - barWidth) / 2
      return h.el('rect').attrs({
        x: String(x),
        y: String(bottom - bar),
        width: String(barWidth),
        height: String(bar),
        rx: '2',
        fill: 'var(--chart-2)',
      })
    }),
    showXAxisLabels
      ? data.map(({ label }, index) =>
          caption(
            h,
            label,
            (index + 0.5) * slot,
            isCompact ? 76 : 57,
            isCompact ? 10 : 4,
          ),
        )
      : undefined,
  )
}

type AreaChartOptions = Styled & {
  readonly id?: string
  readonly ariaLabel?: string
}
export type AreaChartProps = AreaChartOptions & {
  readonly data: readonly number[]
}
export const AreaChart = <Msg>(
  h: Html.H<Msg>,
  { id, data, className, ariaLabel = 'Area chart' }: AreaChartProps,
  styles: ChartClasses = chartClasses,
) => {
  const values = data.map(finite)
  const minimum = values.reduce((min, value) => Math.min(min, value), Infinity)
  const maximum = values.reduce((max, value) => Math.max(max, value), -Infinity)
  const range = maximum - minimum
  const points = values.map((value, index) => ({
    x: (index * 100) / Math.max(1, values.length - 1),
    y: range === 0 ? 25 : 15 + ((maximum - value) / range) * 20,
  }))
  const color = 'var(--muted-foreground)'
  return ChartIds(h, {
    key: id,
    view: ids => {
      const gradientId = ids.gradient('area')
      return svg(
        h,
        '0 0 100 50',
        ariaLabel,
        Html.classNames(styles.chart, className),
      ).children(
        h.el('defs').children(gradient(h, gradientId, color, '0.16')),
        [14, 25, 36].map(y => baseline(h, 0, 100, y)),
        points.length === 0
          ? undefined
          : h.el('path').attrs({
              d: chartAreaPath(points, 50),
              fill: `url(#${gradientId})`,
            }),
        points.length === 0
          ? undefined
          : curve(h, smoothChartPath(points), color, '1'),
      )
    },
  })
}

export type InteractiveAreaChartDatum = Readonly<{
  label: string
  desktop: number
  mobile: number
}>
export type InteractiveAreaChartProps = AreaChartOptions & {
  readonly data: readonly InteractiveAreaChartDatum[]
}
export const InteractiveAreaChart = <Msg>(
  h: Html.H<Msg>,
  {
    id = 'interactive-area',
    data,
    className,
    ariaLabel = 'Desktop and mobile visitors over time',
  }: InteractiveAreaChartProps,
  styles: ChartClasses = chartClasses,
) => {
  const max =
    Math.ceil(
      data.reduce(
        (max, datum) =>
          Math.max(max, finite(datum.desktop), finite(datum.mobile)),
        1,
      ) / 100,
    ) * 100
  const x = (index: number) => 48 + (index * 648) / Math.max(1, data.length - 1)
  const points = (key: 'desktop' | 'mobile') =>
    data.map((datum, index) => ({
      x: x(index),
      y: 18 + ((max - Math.max(0, finite(datum[key]))) / max) * 202,
    }))
  const desktop = points('desktop')
  const mobile = points('mobile')
  const labelStep = Math.max(1, Math.ceil(data.length / 6))
  return ChartIds(h, {
    key: id,
    view: ids => {
      const d = ids.gradient('desktop')
      const m = ids.gradient('mobile')
      return svg(
        h,
        '0 0 720 260',
        ariaLabel,
        Html.classNames(styles.interactiveArea, className),
        'interactive-area-chart',
      ).children(
        h
          .el('defs')
          .children(
            gradient(h, d, 'var(--chart-1)', '0.32'),
            gradient(h, m, 'var(--chart-2)', '0.26'),
          ),
        [0, 0.25, 0.5, 0.75, 1].flatMap(ratio => {
          const y = 18 + ratio * 202
          return [
            baseline(h, 48, 696, y, '1', '3 4'),
            caption(
              h,
              String(Math.round(max * (1 - ratio))),
              38,
              y + 4,
              10,
              'end',
            ),
          ]
        }),
        data.flatMap(({ label }, index) =>
          index % labelStep === 0 || index === data.length - 1
            ? [caption(h, label, x(index), 248, 10)]
            : [],
        ),
        data.length === 0
          ? undefined
          : [
              h
                .el('path')
                .attrs({ d: chartAreaPath(desktop, 220), fill: `url(#${d})` }),
              h
                .el('path')
                .attrs({ d: chartAreaPath(mobile, 220), fill: `url(#${m})` }),
              curve(h, smoothChartPath(desktop), 'var(--chart-1)', '2.5'),
              curve(h, smoothChartPath(mobile), 'var(--chart-2)', '2.5'),
            ],
      )
    },
  })
}

export type DonutChartProps = Styled & {
  readonly value: number
  readonly max: number
  readonly label?: string
  readonly sublabel?: string
}
export const DonutChart = <Msg>(
  h: Html.H<Msg>,
  { value, max, label, sublabel, className }: DonutChartProps,
  styles: ChartClasses = chartClasses,
) => {
  const maximum = Math.max(0, finite(max))
  const ratio =
    maximum === 0 ? 0 : Math.min(1, Math.max(0, finite(value) / maximum))
  const circumference = 2 * Math.PI * 42
  const dash = ratio * circumference
  const circle = {
    cx: '60',
    cy: '60',
    r: '42',
    fill: 'none',
    'stroke-width': '16',
  }
  const text = {
    x: '60',
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
  }
  return svg(
    h,
    '0 0 120 120',
    label ?? `${Math.round(ratio * 100)}% of ${maximum}`,
    Html.classNames(styles.donut, className),
  ).children(
    h.el('circle').attrs({ ...circle, stroke: 'var(--chart-1)' }),
    h.el('circle').attrs({
      ...circle,
      stroke: 'var(--chart-2)',
      'stroke-dasharray': `${dash} ${circumference - dash}`,
      'stroke-linecap': 'butt',
      transform: 'rotate(-90 60 60)',
    }),
    label === undefined
      ? undefined
      : h
          .el('text')
          .attrs({
            ...text,
            y: sublabel === undefined ? '60' : '54',
            fill: 'var(--foreground)',
            'font-size': '14',
            'font-weight': '700',
          })
          .children(label),
    sublabel === undefined
      ? undefined
      : h
          .el('text')
          .attrs({
            ...text,
            y: '70',
            fill: 'var(--muted-foreground)',
            'font-size': '6',
          })
          .children(sublabel),
  )
}
