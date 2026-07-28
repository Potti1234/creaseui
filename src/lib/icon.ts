import { Array, Match as M } from 'effect'
import { type Attribute, type Html, html } from 'foldkit/html'
import iconNodesText from 'lucide-static/icon-nodes.json?raw'

import { cn } from '@/lib/utils'

/* Lucide icons rendered through foldkit's SVG constructors, driven by
   lucide-static's icon-nodes data (same icon set shadcn uses). Use the named
   exports; for anything else call `icon('lucide-name', config)` — and add a
   named export here when a component needs it. */

type IconTag =
  | 'circle'
  | 'ellipse'
  | 'g'
  | 'line'
  | 'path'
  | 'polygon'
  | 'polyline'
  | 'rect'

type IconAttributes = Readonly<{
  cx?: string
  cy?: string
  d?: string
  fill?: string
  height?: string
  points?: string
  r?: string
  rx?: string
  ry?: string
  width?: string
  x?: string
  x1?: string
  x2?: string
  y?: string
  y1?: string
  y2?: string
}>

export type IconNode = ReadonlyArray<readonly [IconTag, IconAttributes]>

export type IconConfig = Readonly<{
  class?: string
  ariaLabel?: string
}>

type H<Msg> = ReturnType<typeof html<Msg>>

const iconNodes: Readonly<Record<string, IconNode>> =
  typeof iconNodesText === 'string'
    ? JSON.parse(iconNodesText)
    : (iconNodesText as Readonly<Record<string, IconNode>>)

const nodeAttributes = <Msg>(
  h: H<Msg>,
  attrs: IconAttributes,
): ReadonlyArray<Attribute<Msg>> => [
  ...(attrs.cx === undefined ? [] : [h.Cx(attrs.cx)]),
  ...(attrs.cy === undefined ? [] : [h.Cy(attrs.cy)]),
  ...(attrs.d === undefined ? [] : [h.D(attrs.d)]),
  ...(attrs.fill === undefined ? [] : [h.Fill(attrs.fill)]),
  ...(attrs.height === undefined ? [] : [h.Height(attrs.height)]),
  ...(attrs.points === undefined ? [] : [h.Points(attrs.points)]),
  ...(attrs.r === undefined ? [] : [h.R(attrs.r)]),
  ...(attrs.rx === undefined ? [] : [h.Rx(attrs.rx)]),
  ...(attrs.ry === undefined ? [] : [h.Ry(attrs.ry)]),
  ...(attrs.width === undefined ? [] : [h.Width(attrs.width)]),
  ...(attrs.x === undefined ? [] : [h.X(attrs.x)]),
  ...(attrs.x1 === undefined ? [] : [h.X1(attrs.x1)]),
  ...(attrs.x2 === undefined ? [] : [h.X2(attrs.x2)]),
  ...(attrs.y === undefined ? [] : [h.Y(attrs.y)]),
  ...(attrs.y1 === undefined ? [] : [h.Y1(attrs.y1)]),
  ...(attrs.y2 === undefined ? [] : [h.Y2(attrs.y2)]),
]

const nodeView = <Msg>(
  h: H<Msg>,
  node: readonly [IconTag, IconAttributes],
): Html =>
  M.value(node[0]).pipe(
    M.withReturnType<Html>(),
    M.when('circle', () => h.circle(nodeAttributes(h, node[1]), [])),
    M.when('ellipse', () => h.ellipse(nodeAttributes(h, node[1]), [])),
    M.when('g', () => h.g(nodeAttributes(h, node[1]), [])),
    M.when('line', () => h.line(nodeAttributes(h, node[1]), [])),
    M.when('path', () => h.path(nodeAttributes(h, node[1]), [])),
    M.when('polygon', () => h.polygon(nodeAttributes(h, node[1]), [])),
    M.when('polyline', () => h.polyline(nodeAttributes(h, node[1]), [])),
    M.when('rect', () => h.rect(nodeAttributes(h, node[1]), [])),
    M.exhaustive,
  )

export const icon = <Msg>(name: string, config: IconConfig = {}): Html => {
  const h = html<Msg>()
  const node = iconNodes[name] ?? []

  return h.svg(
    [
      h.Xmlns('http://www.w3.org/2000/svg'),
      h.ViewBox('0 0 24 24'),
      h.Fill('none'),
      h.Stroke('currentColor'),
      h.StrokeWidth('2'),
      h.StrokeLinecap('round'),
      h.StrokeLinejoin('round'),
      h.Class(cn(`lucide lucide-${name}`, config.class)),
      ...(config.ariaLabel === undefined
        ? [h.AriaHidden(true)]
        : [h.Role('img'), h.AriaLabel(config.ariaLabel)]),
    ],
    Array.map(node, child => nodeView(h, child)),
  )
}

const named =
  (name: string) =>
  <Msg>(config?: IconConfig): Html =>
    icon<Msg>(name, config)

export const arrowLeft = named('arrow-left')
export const arrowRight = named('arrow-right')
export const arrowDown = named('arrow-down')
export const calendarIcon = named('calendar')
export const check = named('check')
export const chevronDown = named('chevron-down')
export const chevronLeft = named('chevron-left')
export const chevronRight = named('chevron-right')
export const chevronUp = named('chevron-up')
export const chevronsUpDown = named('chevrons-up-down')
export const circleCheck = named('circle-check')
export const circleIcon = named('circle')
export const gripVertical = named('grip-vertical')
export const info = named('info')
export const loaderCircle = named('loader-circle')
export const minus = named('minus')
export const moreHorizontal = named('ellipsis')
export const octagonX = named('octagon-x')
export const panelLeft = named('panel-left')
export const plus = named('plus')
export const search = named('search')
export const triangleAlert = named('triangle-alert')
export const x = named('x')
