import { type Html, html } from 'foldkit/html'

import { cn } from '@/lib/utils'

/* Pure-SVG substitutes for the Recharts-backed charts used by preview-02.
   They intentionally cover only the bar, area, and radial presentations
   needed by those cards. */

const finite = (value: number): number =>
  Number.isFinite(value) ? value : 0

export type BarChartDatum = Readonly<{
  label: string
  value: number
}>

export type BarChartProps = Readonly<{
  data: ReadonlyArray<BarChartDatum>
  class?: string
  showXAxisLabels?: boolean
  isCompact?: boolean
}>

export const barChart = <Msg>(props: BarChartProps): Html => {
  const h = html<Msg>()
  const showXAxisLabels = props.showXAxisLabels ?? true
  const isCompact = props.isCompact ?? false
  const chartWidth = isCompact ? 320 : 100
  const chartHeight = isCompact ? 80 : 60
  const plotBottom = isCompact ? 58 : showXAxisLabels ? 48 : 56
  const plotHeight = isCompact ? 48 : plotBottom - 4
  const count = Math.max(props.data.length, 1)
  const slotWidth = chartWidth / count
  const barWidth = Math.max(0.5, Math.min(isCompact ? 16 : 10, slotWidth * 0.64))
  const maximum = Math.max(0, ...props.data.map(item => finite(item.value)))

  return h.svg(
    [
      h.DataAttribute('slot', 'chart'),
      h.Xmlns('http://www.w3.org/2000/svg'),
      h.ViewBox(`0 0 ${String(chartWidth)} ${String(chartHeight)}`),
      h.Role('img'),
      h.AriaLabel('Bar chart'),
      h.Class(cn('h-auto w-full', props.class)),
    ],
    [
      ...props.data.map((item, index) => {
        const value = Math.max(0, finite(item.value))
        const height = maximum === 0 ? 0 : (value / maximum) * plotHeight
        const x = index * slotWidth + (slotWidth - barWidth) / 2

        return h.rect(
          [
            h.X(String(x)),
            h.Y(String(plotBottom - height)),
            h.Width(String(barWidth)),
            h.Height(String(height)),
            h.Rx('2'),
            h.Fill('var(--chart-2)'),
          ],
          [],
        )
      }),
      ...(showXAxisLabels
        ? props.data.map((item, index) =>
            h.text(
              [
                h.X(String(index * slotWidth + slotWidth / 2)),
                h.Y(isCompact ? '76' : '57'),
                h.TextAnchor('middle'),
                h.Fill('var(--muted-foreground)'),
                h.FontSize(isCompact ? '10' : '4'),
              ],
              [item.label],
            ),
          )
        : []),
    ],
  )
}

export type AreaChartProps = Readonly<{
  data: ReadonlyArray<number>
  class?: string
}>

type Point = Readonly<{ x: number; y: number }>

const areaPoints = (data: ReadonlyArray<number>): ReadonlyArray<Point> => {
  const values = data.map(finite)

  if (values.length === 0) {
    return []
  }

  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  const range = maximum - minimum
  const denominator = Math.max(values.length - 1, 1)

  return values.map((value, index) => ({
    x: (index / denominator) * 100,
    y: range === 0 ? 25 : 15 + ((maximum - value) / range) * 20,
  }))
}

const smoothPath = (points: ReadonlyArray<Point>): string => {
  const first = points[0]

  if (first === undefined) {
    return ''
  }

  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index] ?? first
    const midpoint = (previous.x + point.x) / 2
    return `${path} C ${midpoint} ${previous.y}, ${midpoint} ${point.y}, ${point.x} ${point.y}`
  }, `M ${first.x} ${first.y}`)
}

export const areaChart = <Msg>(props: AreaChartProps): Html => {
  const h = html<Msg>()
  const points = areaPoints(props.data)
  const linePath = smoothPath(points)
  const first = points[0]
  const last = points[points.length - 1]
  const fillPath =
    first === undefined || last === undefined
      ? ''
      : `${linePath} L ${last.x} 50 L ${first.x} 50 Z`

  return h.svg(
    [
      h.DataAttribute('slot', 'chart'),
      h.Xmlns('http://www.w3.org/2000/svg'),
      h.ViewBox('0 0 100 50'),
      h.Role('img'),
      h.AriaLabel('Area chart'),
      h.Class(cn('h-auto w-full', props.class)),
    ],
    [
      h.defs(
        [],
        [
          h.linearGradient(
            [
              h.Id('foldkit-area-gradient'),
              h.X1('0'),
              h.Y1('0'),
              h.X2('0'),
              h.Y2('1'),
            ],
            [
              h.stop(
                [
                  h.Offset('0%'),
                  h.StopColor('var(--muted-foreground)'),
                  h.StopOpacity('0.16'),
                ],
                [],
              ),
              h.stop(
                [
                  h.Offset('100%'),
                  h.StopColor('var(--muted-foreground)'),
                  h.StopOpacity('0.02'),
                ],
                [],
              ),
            ],
          ),
        ],
      ),
      ...[14, 25, 36].map(y =>
        h.line(
          [
            h.X1('0'),
            h.Y1(String(y)),
            h.X2('100'),
            h.Y2(String(y)),
            h.Stroke('var(--border)'),
            h.StrokeDasharray('2 2'),
            h.StrokeWidth('0.5'),
          ],
          [],
        ),
      ),
      ...(fillPath === ''
        ? []
        : [
            h.path(
              [h.D(fillPath), h.Fill('url(#foldkit-area-gradient)')],
              [],
            ),
            h.path(
              [
                h.D(linePath),
                h.Fill('none'),
                h.Stroke('var(--muted-foreground)'),
                h.StrokeWidth('1'),
                h.StrokeLinecap('round'),
                h.StrokeLinejoin('round'),
                h.VectorEffect('non-scaling-stroke'),
              ],
              [],
            ),
          ]),
    ],
  )
}

export type DonutChartProps = Readonly<{
  value: number
  max: number
  label?: string
  sublabel?: string
  class?: string
}>

export const donutChart = <Msg>(props: DonutChartProps): Html => {
  const h = html<Msg>()
  const maximum = finite(props.max)
  const ratio =
    maximum <= 0
      ? 0
      : Math.min(1, Math.max(0, finite(props.value) / maximum))
  const circumference = 2 * Math.PI * 42
  const dash = ratio * circumference

  return h.svg(
    [
      h.DataAttribute('slot', 'chart'),
      h.Xmlns('http://www.w3.org/2000/svg'),
      h.ViewBox('0 0 120 120'),
      h.Role('img'),
      h.AriaLabel(
        props.label ??
          `${Math.round(ratio * 100)}% of ${String(Math.max(0, maximum))}`,
      ),
      h.Class(cn('mx-auto aspect-square h-auto w-full', props.class)),
    ],
    [
      h.circle(
        [
          h.Cx('60'),
          h.Cy('60'),
          h.R('42'),
          h.Fill('none'),
          h.Stroke('var(--chart-1)'),
          h.StrokeWidth('16'),
        ],
        [],
      ),
      h.circle(
        [
          h.Cx('60'),
          h.Cy('60'),
          h.R('42'),
          h.Fill('none'),
          h.Stroke('var(--chart-2)'),
          h.StrokeWidth('16'),
          h.StrokeDasharray(`${dash} ${circumference - dash}`),
          h.StrokeLinecap('butt'),
          h.Transform('rotate(-90 60 60)'),
        ],
        [],
      ),
      ...(props.label === undefined
        ? []
        : [
            h.text(
              [
                h.X('60'),
                h.Y(props.sublabel === undefined ? '60' : '54'),
                h.TextAnchor('middle'),
                h.DominantBaseline('middle'),
                h.Fill('var(--foreground)'),
                h.FontSize('14'),
                h.FontWeight('700'),
              ],
              [props.label],
            ),
          ]),
      ...(props.sublabel === undefined
        ? []
        : [
            h.text(
              [
                h.X('60'),
                h.Y('70'),
                h.TextAnchor('middle'),
                h.DominantBaseline('middle'),
                h.Fill('var(--muted-foreground)'),
                h.FontSize('6'),
              ],
              [props.sublabel],
            ),
          ]),
    ],
  )
}
