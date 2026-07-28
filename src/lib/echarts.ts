import {
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart,
} from 'echarts/charts'
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  PolarComponent,
  RadarComponent,
  TooltipComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts/types/dist/shared'
import { Effect, Option, Schema as S } from 'effect'
import { Command, Mount } from 'foldkit'
import { type Html, html } from 'foldkit/html'
import { m } from 'foldkit/message'

import { cn } from '@/lib/utils'

/* ECharts embedded in foldkit, adapted from maas-foldkit's ui/chart.ts Mount +
   chart-host bridge. Where shadcn wraps recharts (React-only), we render the
   same visual language through Apache ECharts:

   - Each demo card module registers an OPTION BUILDER at module load time,
     keyed by its host id. Builders are (theme, variant) => EChartsOption, so
     views stay pure and Commands stay serializable (they carry only strings).
   - The Mount inits echarts on the host element, resolves the CSS design
     tokens from the element (so scoped overrides like .create-board-theme
     apply), applies the builder's option, and keeps the chart responsive via
     ResizeObserver. Canvas cannot resolve CSS variables, so series colors are
     resolved to concrete values here; the DOM-based tooltip CAN use CSS vars.
   - Theme tokens are resolved once at mount (the demo is light-mode; a theme
     switcher would re-mount or re-sync). */

let registered = false

const ensureRegistered = (): void => {
  if (!registered) {
    echarts.use([
      LineChart,
      BarChart,
      PieChart,
      RadarChart,
      ScatterChart,
      GridComponent,
      TooltipComponent,
      LegendComponent,
      PolarComponent,
      RadarComponent,
      DatasetComponent,
      CanvasRenderer,
    ])
    registered = true
  }
}

// THEME — design tokens resolved from the mount element

export type ChartTheme = Readonly<{
  chart1: string
  chart2: string
  chart3: string
  chart4: string
  chart5: string
  border: string
  mutedForeground: string
  foreground: string
  background: string
  primary: string
  fontFamily: string
}>

/* Tokens are authored in oklch(). The browser paints those fine, but ECharts/
   zrender parse color strings THEMSELVES for hover emphasis, highlight lift,
   and gradient interpolation — and that parser only understands rgb/hex/hsl.
   Feeding it oklch() blanks the series whenever the pointer hovers the chart.

   getComputedStyle does NOT help here: CSS Color 4 keeps oklch()/lab()/color()
   in their own serialization instead of converting to rgb. The one conversion
   the platform guarantees is painting: fill a 1x1 canvas with the color and
   read the pixel back. */
let probeContext: CanvasRenderingContext2D | null = null

const resolveToRgb = (cssColor: string): string => {
  if (probeContext === null) {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    probeContext = canvas.getContext('2d', { willReadFrequently: true })
  }
  if (probeContext === null) {
    return cssColor
  }

  probeContext.clearRect(0, 0, 1, 1)
  probeContext.fillStyle = cssColor
  probeContext.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = probeContext.getImageData(0, 0, 1, 1).data

  return a === 255
    ? `rgb(${r}, ${g}, ${b})`
    : `rgba(${r}, ${g}, ${b}, ${((a ?? 0) / 255).toFixed(3)})`
}

export const resolveTheme = (element: HTMLElement): ChartTheme => {
  const style = getComputedStyle(element)
  const token = (name: string): string =>
    resolveToRgb(style.getPropertyValue(name).trim())

  return {
    chart1: token('--chart-1'),
    chart2: token('--chart-2'),
    chart3: token('--chart-3'),
    chart4: token('--chart-4'),
    chart5: token('--chart-5'),
    border: token('--border'),
    mutedForeground: token('--muted-foreground'),
    foreground: token('--foreground'),
    background: token('--background'),
    primary: token('--primary'),
    fontFamily: style.fontFamily,
  }
}

// SHADCN LOOK HELPERS — shared bits builders compose into their options

/** Muted 12px axis labels, no axis/tick lines — shadcn's XAxis look.
 *  Area/line charts render edge-to-edge (boundaryGap false, recharts-style);
 *  bar charts pass boundaryGap: true. */
export const categoryAxis = (
  theme: ChartTheme,
  data: ReadonlyArray<string>,
  config: Readonly<{ boundaryGap?: boolean }> = {},
): NonNullable<EChartsOption['xAxis']> => ({
  type: 'category',
  data: [...data],
  boundaryGap: config.boundaryGap ?? false,
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: {
    color: theme.mutedForeground,
    fontSize: 12,
    fontFamily: theme.fontFamily,
    margin: 10,
  },
})

/** Hidden-by-default value axis with dashed splitlines — shadcn's grid look. */
export const valueAxis = (
  theme: ChartTheme,
  config: Readonly<{ showLabels?: boolean }> = {},
): NonNullable<EChartsOption['yAxis']> => ({
  type: 'value',
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: {
    show: config.showLabels ?? false,
    color: theme.mutedForeground,
    fontSize: 12,
    fontFamily: theme.fontFamily,
  },
  splitLine: { lineStyle: { color: theme.border, type: 'dashed' } },
})

/** Compact plot area matching shadcn's tight ChartContainer margins. */
export const compactGrid = (
  config: Readonly<{ left?: number; right?: number; top?: number; bottom?: number }> = {},
): NonNullable<EChartsOption['grid']> => ({
  left: config.left ?? 12,
  right: config.right ?? 12,
  top: config.top ?? 12,
  bottom: config.bottom ?? 24,
  containLabel: true,
})

type TooltipRow = Readonly<{
  marker: string
  seriesName?: string
  name?: string
  value?: number | string | ReadonlyArray<number | string>
  color?: string
}>

const tooltipRowHtml = (row: TooltipRow): string => {
  const label = row.seriesName || row.name || ''
  const value = Array.isArray(row.value) ? row.value[1] : row.value

  return `<div style="display:flex;align-items:center;gap:6px;min-width:8rem">
    <span style="width:10px;height:10px;border-radius:2.5px;background:${row.color ?? 'transparent'};flex-shrink:0"></span>
    <span style="color:var(--muted-foreground)">${label}</span>
    <span style="margin-left:auto;font-variant-numeric:tabular-nums;font-weight:500;color:var(--foreground)">${value ?? ''}</span>
  </div>`
}

/** shadcn ChartTooltipContent look: rounded border bg-background text-xs with
 *  a rounded color chip, muted label, tabular-nums value. The tooltip is DOM,
 *  so CSS variables apply directly. */
export const shadcnTooltip = (
  theme: ChartTheme,
  config: Readonly<{ trigger?: 'axis' | 'item' }> = {},
): NonNullable<EChartsOption['tooltip']> => ({
  trigger: config.trigger ?? 'axis',
  confine: true,
  backgroundColor: 'var(--background)',
  borderColor: 'var(--border)',
  borderWidth: 1,
  padding: [6, 10],
  extraCssText:
    'border-radius:8px;box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);',
  textStyle: {
    color: theme.foreground,
    fontSize: 12,
    fontFamily: theme.fontFamily,
  },
  axisPointer: { type: 'none' },
  formatter: params => {
    const rows: ReadonlyArray<TooltipRow> = Array.isArray(params)
      ? (params as ReadonlyArray<TooltipRow>)
      : [params as TooltipRow]
    const heading = Array.isArray(params)
      ? ((params[0] as { name?: string }).name ?? '')
      : ''
    const headingHtml = heading
      ? `<div style="font-weight:500;margin-bottom:4px;color:var(--foreground)">${heading}</div>`
      : ''

    return `${headingHtml}${rows.map(tooltipRowHtml).join('')}`
  },
})

/** Bottom legend with muted text and small rounded markers. */
export const shadcnLegend = (theme: ChartTheme): NonNullable<EChartsOption['legend']> => ({
  bottom: 0,
  icon: 'roundRect',
  itemWidth: 10,
  itemHeight: 10,
  itemGap: 16,
  textStyle: {
    color: theme.mutedForeground,
    fontSize: 12,
    fontFamily: theme.fontFamily,
  },
})

/** Vertical fade used by shadcn's gradient area charts. */
export const areaGradient = (
  color: string,
  config: Readonly<{ from?: number; to?: number }> = {},
): NonNullable<object> =>
  new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: colorWithOpacity(color, config.from ?? 0.8) },
    { offset: 1, color: colorWithOpacity(color, config.to ?? 0.1) },
  ])

/** Applies opacity to a theme color. Theme colors arrive as resolved rgb()/
 *  rgba() strings (see resolveTheme), so this emits plain rgba() — the only
 *  alpha form zrender's own color parser accepts. Falls back to color-mix for
 *  non-rgb inputs (DOM-rendered contexts only, never canvas). */
export const colorWithOpacity = (color: string, opacity: number): string => {
  const match = color.match(
    /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+[\d.]+)?\s*\)$/,
  )

  return match
    ? `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`
    : `color-mix(in oklab, ${color} ${Math.round(opacity * 100)}%, transparent)`
}

// OPTION BUILDER REGISTRY — cards register at module load, the Mount applies

export type OptionBuilder = (theme: ChartTheme, variant: string) => EChartsOption

const buildersByHostId = new Map<string, OptionBuilder>()

export const registerChart = (hostId: string, builder: OptionBuilder): void => {
  buildersByHostId.set(hostId, builder)
}

// HOST BRIDGE — live chart instances keyed by host id (sanctioned escape hatch)

const chartsByHostId = new Map<string, echarts.EChartsType>()

// Dev-only escape hatch for debugging chart instances from the console/tests.
if (import.meta.env.DEV) {
  ;(window as unknown as Record<string, unknown>).__charts = chartsByHostId
}

const applyOption = (
  hostId: string,
  chart: echarts.EChartsType,
  variant: string,
): void => {
  const builder = buildersByHostId.get(hostId)
  if (builder) {
    const element = chart.getDom()
    chart.setOption(builder(resolveTheme(element), variant), true)
  }
}

// MESSAGES

export const ChartMounted = m('ChartMounted', { hostId: S.String })
export const ChartMountFailed = m('ChartMountFailed', { reason: S.String })
export const ChartSynced = m('ChartSynced')

export const ChartMessage = S.Union([ChartMounted, ChartMountFailed, ChartSynced])
export type ChartMessage = typeof ChartMessage.Type

// COMMANDS + MOUNT

/** Re-applies the registered builder with a new variant key (e.g. the
 *  interactive charts' time-range selection). */
export const SyncChart = Command.define(
  'SyncChart',
  { hostId: S.String, variant: S.String },
  ChartSynced,
)(({ hostId, variant }) =>
  Effect.sync(() => {
    const chart = chartsByHostId.get(hostId)
    if (chart) {
      applyOption(hostId, chart, variant)
    }
    return ChartSynced()
  }),
)

export const MountChart = Mount.define(
  'MountChart',
  { hostId: S.String, variant: S.String },
  ChartMounted,
  ChartMountFailed,
)(
  ({ hostId, variant }) =>
    element =>
      Effect.gen(function* () {
        if (!(element instanceof HTMLElement)) {
          return ChartMountFailed({ reason: 'Chart host is not an HTMLElement.' })
        }

        return yield* Effect.acquireRelease(
          Effect.try({
            try: () => {
              ensureRegistered()
              const chart = echarts.init(element, undefined, {
                renderer: 'canvas',
              })
              const resizeObserver = new ResizeObserver(() => chart.resize())
              resizeObserver.observe(element)
              chartsByHostId.set(hostId, chart)
              applyOption(hostId, chart, variant)
              return { chart, resizeObserver }
            },
            catch: error =>
              error instanceof Error
                ? error
                : new Error(`Chart mount failed: ${error}`),
          }),
          ({ chart, resizeObserver }) =>
            Effect.sync(() => {
              resizeObserver.disconnect()
              chart.dispose()
              chartsByHostId.delete(hostId)
            }),
        ).pipe(
          Effect.map(() => ChartMounted({ hostId })),
          Effect.catch(error =>
            Effect.succeed(ChartMountFailed({ reason: error.message })),
          ),
        )
      }),
)

// VIEW

export type ChartProps<Msg> = Readonly<{
  hostId: string
  ariaLabel: string
  toMessage: (message: ChartMessage) => Msg
  variant?: string
  class?: string
}>

export const chart = <Msg>(props: ChartProps<Msg>): Html => {
  const h = html<Msg>()

  return h.div(
    [
      h.Class(cn('aspect-video w-full', props.class)),
      h.Role('img'),
      h.AriaLabel(props.ariaLabel),
      h.OnMount(
        Mount.mapMessage(
          MountChart({ hostId: props.hostId, variant: props.variant ?? '' }),
          props.toMessage,
        ),
      ),
    ],
    [],
  )
}
