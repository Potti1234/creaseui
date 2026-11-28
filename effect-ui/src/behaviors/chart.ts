import type * as EChartsCore from 'echarts/core'
import type {
  EChartsOption,
  GridOption,
  XAXisOption,
  YAXisOption,
} from 'echarts/types/dist/shared'
import { Command, Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Effect, Queue, Schema, Stream } from 'effect'

let echartsPromise: Promise<typeof EChartsCore> | undefined

const loadECharts = (): Promise<typeof EChartsCore> => {
  if (echartsPromise === undefined) {
    echartsPromise = Promise.all([
      import('echarts/core'),
      import('echarts/charts'),
      import('echarts/components'),
      import('echarts/renderers'),
    ])
      .then(([echartsRuntime, charts, components, renderers]) => {
        echartsRuntime.use([
          charts.LineChart,
          charts.BarChart,
          charts.PieChart,
          charts.RadarChart,
          charts.ScatterChart,
          components.GridComponent,
          components.TooltipComponent,
          components.LegendComponent,
          components.PolarComponent,
          components.RadarComponent,
          components.DatasetComponent,
          renderers.CanvasRenderer,
        ])
        return echartsRuntime
      })
      .catch(error => {
        echartsPromise = undefined
        throw error
      })
  }
  return echartsPromise
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
  if (cssColor === '') return 'transparent'
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
  probeContext.fillStyle = 'transparent'
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

export type CategoryAxisOptions = Extract<XAXisOption, { type?: 'category' }>
export type ValueAxisOptions = Extract<YAXisOption, { type?: 'value' }>

/** Muted 12px axis labels, no axis/tick lines — shadcn's XAxis look.
 *  Area/line charts render edge-to-edge (boundaryGap false, recharts-style);
 *  bar charts pass boundaryGap: true. */
export const categoryAxis = (
  theme: ChartTheme,
  data: ReadonlyArray<string>,
  config: Readonly<{
    boundaryGap?: boolean
    axisLabel?: CategoryAxisOptions['axisLabel']
  }> = {},
): CategoryAxisOptions => ({
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
    ...config.axisLabel,
  },
})

/** Hidden-by-default value axis with dashed splitlines — shadcn's grid look. */
export const valueAxis = (
  theme: ChartTheme,
  config: Readonly<{
    showLabels?: boolean
    axisLabel?: ValueAxisOptions['axisLabel']
  }> = {},
): ValueAxisOptions => ({
  type: 'value',
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: {
    show: config.showLabels ?? false,
    color: theme.mutedForeground,
    fontSize: 12,
    fontFamily: theme.fontFamily,
    ...config.axisLabel,
  },
  splitLine: { lineStyle: { color: theme.border, type: 'dashed' } },
})

/** Compact plot area matching shadcn's tight ChartContainer margins. */
export const compactGrid = (
  config: Readonly<{
    left?: number
    right?: number
    top?: number
    bottom?: number
  }> = {},
): GridOption => ({
  left: config.left ?? 12,
  right: config.right ?? 12,
  top: config.top ?? 12,
  bottom: config.bottom ?? 24,
  outerBoundsMode: 'same',
  outerBoundsContain: 'axisLabel',
})

type TooltipRow = Readonly<{
  marker: string
  seriesName?: string
  name?: string
  value?: number | string | ReadonlyArray<number | string>
  color?: string
}>

const escapeHtml = (value: string | number): string =>
  String(value).replace(
    /[&<>"']/g,
    character =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character] ?? character,
  )

const tooltipRowHtml = (
  row: TooltipRow,
  preferName: boolean,
  formatValue?: (value: number) => number | string,
): string => {
  // Item-triggered tooltips describe the datum (pie slice, radar series) —
  // seriesName is an auto-generated 'series0' when the series is unnamed.
  // Axis-triggered tooltips describe the series; the category name is the
  // heading.
  const label = preferName
    ? row.name || row.seriesName || ''
    : row.seriesName || row.name || ''
  const source = Array.isArray(row.value) ? row.value[1] : row.value
  const raw =
    typeof source === 'number' || typeof source === 'string' ? source : ''
  const value = formatValue && typeof raw === 'number' ? formatValue(raw) : raw
  const color =
    typeof row.color === 'string' && !/[;<>]/.test(row.color)
      ? row.color
      : 'transparent'

  return `<div style="display:flex;align-items:center;gap:6px;min-width:8rem">
    <span style="width:10px;height:10px;border-radius:2.5px;background:${escapeHtml(color)};flex-shrink:0"></span>
    <span style="color:var(--muted-foreground)">${escapeHtml(label)}</span>
    <span style="margin-left:auto;font-variant-numeric:tabular-nums;font-weight:500;color:var(--foreground)">${escapeHtml(value)}</span>
  </div>`
}

/** shadcn ChartTooltipContent look: rounded border bg-background text-xs with
 *  a rounded color chip, muted label, tabular-nums value. The tooltip is DOM,
 *  so CSS variables apply directly. `formatHeading` rewrites the axis heading —
 *  needed when the axis uses slot ids (see `slotIds`) instead of real labels. */
export const shadcnTooltip = (
  theme: ChartTheme,
  config: Readonly<{
    trigger?: 'axis' | 'item'
    formatHeading?: (name: string, dataIndex: number) => string
    /** Resampled slots interpolate between real points — round the leak. */
    formatValue?: (value: number) => number | string
  }> = {},
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
    const first = Array.isArray(params)
      ? (params[0] as { name?: string; dataIndex?: number })
      : undefined
    const rawHeading = first?.name ?? ''
    const heading =
      config.formatHeading && first
        ? config.formatHeading(rawHeading, first.dataIndex ?? 0)
        : rawHeading
    const headingHtml = heading
      ? `<div style="font-weight:500;margin-bottom:4px;color:var(--foreground)">${escapeHtml(heading)}</div>`
      : ''

    const itemTooltip = config.trigger === 'item'
    return `${headingHtml}${rows
      .map(row => tooltipRowHtml(row, itemTooltip, config.formatValue))
      .join('')}`
  },
})

/** Bottom legend with muted text and small rounded markers. */
export const shadcnLegend = (
  theme: ChartTheme,
): NonNullable<EChartsOption['legend']> => ({
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

/** CreaseUI tooltip and legend presets for chart examples. */
export const tooltipOptions = shadcnTooltip
export const legendOptions = shadcnLegend

/** Spread into the option of any chart that switches variants — a 1500ms
 *  cubicInOut morph, matching recharts' default data tween (duration 1500,
 *  easing 'ease'). */
export const updateAnimation = (): Pick<
  EChartsOption,
  'animationDurationUpdate' | 'animationEasingUpdate'
> => ({
  animationDurationUpdate: 1500,
  animationEasingUpdate: 'cubicInOut',
})

/** Stable category names for a fixed slot count. ECharts diffs category-axis
 *  data by name: when a range switch emits differently-named categories only
 *  the overlapping names morph and the rest re-enter (the chart "flows in").
 *  Feeding the same slot names across variants pairs every point 1:1, so the
 *  whole shape morphs in place — the recharts look. Pair with `resample` when
 *  the variant's point count differs from the slot count. */
export const slotIds = (count: number): ReadonlyArray<string> =>
  Array.from({ length: count }, (_, index) => `s${index}`)

/** Evenly resample a numeric series onto a fixed slot count so merge-mode
 *  morphs keep a point for every slot — endpoints stay exact. */
export const resample = (
  values: ReadonlyArray<number>,
  slots: number,
): Array<number> => {
  if (values.length === slots) return [...values]
  if (values.length === 0) return Array.from({ length: slots }, () => 0)
  if (slots === 1) return [values[0] ?? 0]
  const last = values.length - 1
  return Array.from({ length: slots }, (_, index) => {
    const position = (index * last) / (slots - 1)
    const lo = Math.floor(position)
    const hi = Math.min(lo + 1, last)
    return (
      (values[lo] ?? 0) +
      ((values[hi] ?? 0) - (values[lo] ?? 0)) * (position - lo)
    )
  })
}

/** Vertical fade used by shadcn's gradient area charts. */
export const areaGradient = (
  color: string,
  config: Readonly<{ from?: number; to?: number }> = {},
): NonNullable<object> => ({
  type: 'linear',
  x: 0,
  y: 0,
  x2: 0,
  y2: 1,
  colorStops: [
    { offset: 0, color: colorWithOpacity(color, config.from ?? 0.8) },
    { offset: 1, color: colorWithOpacity(color, config.to ?? 0.1) },
  ],
})

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

export type OptionBuilder = (
  theme: ChartTheme,
  variant: string,
) => EChartsOption

const buildersByHostId = new Map<string, OptionBuilder>()

export const registerChart = (hostId: string, builder: OptionBuilder): void => {
  buildersByHostId.set(hostId, builder)
}

export const ChartMessage = UiSchema.TaggedEnum({
  ChartMounted: { hostId: Schema.String },
  ChartMountFailed: { reason: Schema.String },
  CompletedSyncChart: {},
})
export type ChartMessage = typeof ChartMessage.Type

const mountedByHostId = new Map<string, (variant: string) => void>()
const failure = (error: unknown) =>
  ChartMessage.ChartMountFailed({
    reason: error instanceof Error ? error.message : String(error),
  })

export const SyncChart = Command.make(
  'CreaseSyncChart',
  { args: { hostId: Schema.String, variant: Schema.String } },
  ({ hostId, variant }) =>
    Effect.sync(() => {
      mountedByHostId.get(hostId)?.(variant)
      return ChartMessage.CompletedSyncChart()
    }),
)

/** Canvas, theme observations, and resize tracking live for the lifetime of the host. */
export const MountChart = Mount.makeStream(
  'CreaseMountChart',
  { args: { hostId: Schema.String, variant: Schema.String } },
  (element: HTMLElement, args, changes) =>
    Stream.callback<ChartMessage>(queue =>
      Effect.gen(function* () {
        yield* Effect.promise(() => element.ownerDocument.fonts.ready)
        const api = yield* Effect.tryPromise(loadECharts)
        const chart = yield* Effect.acquireRelease(
          Effect.sync(() =>
            api.init(element, undefined, { renderer: 'canvas' }),
          ),
          chart => Effect.sync(() => chart.dispose()),
        )
        let hostId = args.hostId
        let variant = args.variant
        let updateFrame = 0
        let resizeFrame = 0
        let lastTheme = ''
        const apply = (force = false) => {
          try {
            const theme = resolveTheme(element)
            const nextTheme = JSON.stringify(theme)
            if (!force && lastTheme === nextTheme) return
            const builder = buildersByHostId.get(hostId)
            if (builder === undefined)
              throw new Error(`No chart registered for ${hostId}.`)
            chart.setOption(builder(theme, variant))
            lastTheme = nextTheme
          } catch (error) {
            Queue.offerUnsafe(queue, failure(error))
          }
        }
        const sync = (next: string) => {
          variant = next
          apply(true)
        }
        const releaseRegistration = () => {
          if (mountedByHostId.get(hostId) === sync)
            mountedByHostId.delete(hostId)
        }
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            const resize = new ResizeObserver(() => {
              cancelAnimationFrame(resizeFrame)
              resizeFrame = requestAnimationFrame(() => chart.resize())
            })
            const observer = new MutationObserver(() => {
              cancelAnimationFrame(updateFrame)
              updateFrame = requestAnimationFrame(() => apply())
            })
            resize.observe(element)
            for (
              let ancestor: HTMLElement | null = element;
              ancestor !== null;
              ancestor = ancestor.parentElement
            ) {
              observer.observe(ancestor, {
                attributes: true,
                attributeFilter: ['class', 'style', 'data-theme'],
              })
            }
            mountedByHostId.set(hostId, sync)
            return { resize, observer }
          }),
          ({ resize, observer }) =>
            Effect.sync(() => {
              cancelAnimationFrame(updateFrame)
              cancelAnimationFrame(resizeFrame)
              resize.disconnect()
              observer.disconnect()
              releaseRegistration()
            }),
        )
        sync(variant)
        if (lastTheme !== '')
          Queue.offerUnsafe(queue, ChartMessage.ChartMounted({ hostId }))
        yield* Stream.runForEach(changes, next =>
          Effect.sync(() => {
            if (hostId !== next.hostId) {
              releaseRegistration()
              hostId = next.hostId
              mountedByHostId.set(hostId, sync)
              chart.clear()
            }
            sync(next.variant)
          }),
        ).pipe(Effect.forkScoped)
        return yield* Effect.never
      }).pipe(
        Effect.catchCause(cause =>
          Effect.sync(() => Queue.offerUnsafe(queue, failure(cause))),
        ),
      ),
    ),
)

export type ChartPoint = Readonly<{ x: number; y: number }>
export const finite = (value: number): number =>
  Number.isFinite(value) ? value : 0

/** The SVG recipes use the same rounded Bezier connector. */
export const smoothChartPath = (points: readonly ChartPoint[]): string => {
  const first = points[0]
  return first === undefined
    ? ''
    : points.slice(1).reduce((path, point, index) => {
        const previous = points[index] ?? first
        const midpoint = (previous.x + point.x) / 2
        return `${path} C ${midpoint} ${previous.y}, ${midpoint} ${point.y}, ${point.x} ${point.y}`
      }, `M ${first.x} ${first.y}`)
}

export const chartAreaPath = (
  points: readonly ChartPoint[],
  bottom: number,
): string => {
  const first = points[0]
  const last = points.at(-1)
  return first === undefined || last === undefined
    ? ''
    : `${smoothChartPath(points)} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`
}

/** Each mounted SVG owns its gradient names, including during server rendering. */
export const ChartIds = Html.component({
  name: 'CreaseSvgChartIds',
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: $ => $.model,
  parts: p => ({ gradient: (series: string) => p.id(`gradient-${series}`) }),
})
