import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
} from '@floating-ui/dom'
import type { VirtualElement } from '@floating-ui/dom'
import { Anchor } from '@foldkit/ui'
import { Effect, Schema as S } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'

export const AnchorConfig = Anchor.AnchorConfig
export type AnchorConfig = typeof AnchorConfig.Type

export const Side = S.Literals([
  'top',
  'right',
  'bottom',
  'left',
  'start',
  'end',
])
export type Side = typeof Side.Type
export const Align = S.Literals(['start', 'center', 'end'])
export type Align = typeof Align.Type

export const PlacementOptions = S.Struct({
  side: S.optionalKey(Side),
  align: S.optionalKey(Align),
  sideOffset: S.optionalKey(S.Number),
  alignOffset: S.optionalKey(S.Number),
  collisionPadding: S.optionalKey(S.Number),
  arrowPadding: S.optionalKey(S.Number),
})
export type PlacementOptions = typeof PlacementOptions.Type

const placement = (
  { side = 'bottom', align = 'start' }: PlacementOptions,
  rtl: boolean,
): Anchor.Placement => {
  const physical =
    side === 'start'
      ? rtl
        ? 'right'
        : 'left'
      : side === 'end'
        ? rtl
          ? 'left'
          : 'right'
        : side
  return align === 'center' ? physical : `${physical}-${align}`
}

/** Foldkit owns collision handling, scroll tracking, portal and focus policy. */
export const bindAnchor = (
  panel: Element,
  config: Anchor.SetupConfig,
): (() => void) => Anchor.anchorSetup(panel, config)

export const Message = defineMessageUnion({ CompletedPosition: {} })
export type Message = typeof Message.Type

export const mount = Mount.define('AttachPositionAnchor', {
  args: {
    buttonId: S.String,
    anchor: AnchorConfig,
    interceptTab: S.optionalKey(S.Boolean),
    focusAfterPosition: S.optionalKey(S.Boolean),
    focusSelector: S.optionalKey(S.String),
    arrowId: S.optionalKey(S.String),
    arrowPadding: S.optionalKey(S.Number),
  },
  messages: [Message.CompletedPosition],
  execute: ({ element, viewStateChanges: _viewStateChanges, ...config }) =>
    Effect.acquireRelease(
      Effect.sync(() => bindAnchor(element, config)),
      cleanup => Effect.sync(cleanup),
    ).pipe(Effect.as(Message.CompletedPosition())),
})

export const view = <Msg>(
  config: Anchor.SetupConfig,
  send: (message: Message) => Msg,
  h: HtmlBuilder<Msg>,
) => [
  h.Style({ position: 'absolute', margin: '0', visibility: 'hidden' }),
  h.OnMount(Mount.mapMessage(mount(config), send)),
]

export const Point = S.Struct({ x: S.Number, y: S.Number })
export type Point = typeof Point.Type
export const mountPoint = Mount.define('AttachPointPosition', {
  args: {
    point: Point,
    options: S.optionalKey(PlacementOptions),
  },
  messages: [Message.CompletedPosition],
  execute: ({ element, point, options }) =>
    Effect.acquireRelease(
      Effect.sync(() =>
        element instanceof HTMLElement
          ? position(point, element, options)
          : () => {},
      ),
      cleanup => Effect.sync(cleanup),
    ).pipe(Effect.as(Message.CompletedPosition())),
})

export type Reference =
  | Element
  | Point
  | Readonly<{
      getBoundingClientRect: () => Point &
        Readonly<{ width: number; height: number }>
      contextElement?: Element
    }>
type Source<T> = T | (() => T)
export type PositionOptions = PlacementOptions &
  Readonly<{ arrow?: Source<Element | null | undefined> }>

const read = <T>(source: Source<T>): T =>
  typeof source === 'function' ? (source as () => T)() : source

const asReference = (anchor: Reference): Element | VirtualElement =>
  anchor instanceof Element
    ? anchor
    : {
        ...('contextElement' in anchor
          ? { contextElement: anchor.contextElement }
          : {}),
        getBoundingClientRect: () => {
          if ('getBoundingClientRect' in anchor) {
            const { x, y, width, height } = anchor.getBoundingClientRect()
            return new DOMRect(x, y, width, height)
          }
          return new DOMRect(anchor.x, anchor.y)
        },
      }

const styleNames = [
  'position',
  'margin',
  'left',
  'top',
  '--available-width',
  '--available-height',
  '--arrow-x',
  '--arrow-y',
  '--transform-origin',
] as const

export type Cleanup = (() => void) & { place: () => void; follow: () => void }

/** Position a point, a live rect (such as a Range), or a DOM reference.
 * Use bindAnchor instead for Foldkit's id-based portal and focus integration. */
export const position = (
  anchorSource: Source<Reference | null | undefined>,
  panel: HTMLElement,
  optionsSource: Source<PositionOptions> = {},
): Cleanup => {
  const win = panel.ownerDocument.defaultView
  if (win === null) {
    const noop = () => {}
    return Object.assign(noop, { place: noop, follow: noop })
  }
  const savedStyles = styleNames.map(name => ({
    name,
    value: panel.style.getPropertyValue(name),
    priority: panel.style.getPropertyPriority(name),
  }))
  const attributes = ['data-side', 'data-align'] as const
  const snapshot = (element: Element) => ({
    element,
    values: attributes.map(name => element.getAttribute(name)),
  })
  const restoreAttributes = ({
    element,
    values,
  }: ReturnType<typeof snapshot>) =>
    attributes.forEach((name, index) => {
      const value = values[index]
      if (value == null) element.removeAttribute(name)
      else element.setAttribute(name, value)
    })
  const savedPanel = snapshot(panel)
  let savedArrow: ReturnType<typeof snapshot> | undefined
  let active = true
  let running = false
  let queued = false
  let signature = ''
  let lastArrow: Element | null | undefined
  let frame: number | undefined
  let warned = false
  panel.style.position = 'fixed'
  panel.style.margin = '0'

  const place = (): void => {
    if (!active) return
    const anchor = read(anchorSource)
    if (anchor == null) return
    if (running) {
      queued = true
      return
    }
    const options = read(optionsSource)
    const requestedArrow = read(options.arrow)
    const arrowElement =
      requestedArrow &&
      panel.contains(requestedArrow) &&
      requestedArrow !== panel
        ? requestedArrow
        : undefined
    const padding = options.collisionPadding ?? 8
    const rtl = win.getComputedStyle(panel).direction === 'rtl'
    let availableWidth = 0
    let availableHeight = 0
    running = true
    void computePosition(asReference(anchor), panel, {
      strategy: 'fixed',
      placement: placement(options, rtl),
      middleware: [
        offset({
          mainAxis: options.sideOffset ?? 4,
          crossAxis: options.alignOffset ?? 0,
        }),
        flip({ padding }),
        shift({ padding }),
        size({
          padding,
          apply: result => {
            availableWidth = result.availableWidth
            availableHeight = result.availableHeight
          },
        }),
        ...(arrowElement === undefined
          ? []
          : [
              arrow({
                element: arrowElement,
                padding: options.arrowPadding ?? 6,
              }),
            ]),
      ],
    })
      .then(result => {
        if (!active) return
        warned = false
        const [side = 'bottom', align = 'center'] = result.placement.split('-')
        panel.style.left = `${result.x}px`
        panel.style.top = `${result.y}px`
        panel.style.setProperty(
          '--available-width',
          `${Math.max(0, availableWidth)}px`,
        )
        panel.style.setProperty(
          '--available-height',
          `${Math.max(0, availableHeight)}px`,
        )
        panel.setAttribute('data-side', side)
        panel.setAttribute('data-align', align)
        if (savedArrow?.element !== arrowElement) {
          if (savedArrow !== undefined) restoreAttributes(savedArrow)
          savedArrow =
            arrowElement === undefined ? undefined : snapshot(arrowElement)
        }
        arrowElement?.setAttribute('data-side', side)
        arrowElement?.setAttribute('data-align', align)
        const { x, y } = result.middlewareData.arrow ?? {}
        panel.style.setProperty(
          '--arrow-x',
          x === undefined ? 'initial' : `${x}px`,
        )
        panel.style.setProperty(
          '--arrow-y',
          y === undefined ? 'initial' : `${y}px`,
        )
        const cross =
          align === 'center'
            ? 'center'
            : (align === 'start') !== rtl
              ? 'left'
              : 'right'
        const originX =
          side === 'left'
            ? 'right'
            : side === 'right'
              ? 'left'
              : x === undefined
                ? cross
                : `${x + (arrowElement?.getBoundingClientRect().width ?? 0) / 2}px`
        const originY =
          side === 'top'
            ? 'bottom'
            : side === 'bottom'
              ? 'top'
              : y === undefined
                ? align === 'start'
                  ? 'top'
                  : align === 'end'
                    ? 'bottom'
                    : 'center'
                : `${y + (arrowElement?.getBoundingClientRect().height ?? 0) / 2}px`
        panel.style.setProperty('--transform-origin', `${originX} ${originY}`)
      })
      .catch((error: unknown) => {
        if (active && !warned) {
          warned = true
          console.error(
            '[CreaseUI] Could not position floating content.',
            error,
          )
        }
      })
      .finally(() => {
        running = false
        if (queued) {
          queued = false
          place()
        }
      })
  }

  const initial = read(anchorSource)
  const watchFrame =
    typeof anchorSource === 'function' ||
    (initial != null && !(initial instanceof Element)) ||
    typeof optionsSource === 'function' ||
    typeof read(optionsSource).arrow === 'function'
  const stop =
    initial == null ? undefined : autoUpdate(asReference(initial), panel, place)
  const checkFrame = () => {
    const reference = read(anchorSource)
    const options = read(optionsSource)
    const arrowElement = read(options.arrow)
    const rect =
      reference == null
        ? undefined
        : asReference(reference).getBoundingClientRect()
    const next = [
      rect?.x,
      rect?.y,
      rect?.width,
      rect?.height,
      options.side,
      options.align,
      options.sideOffset,
      options.alignOffset,
      options.collisionPadding,
      options.arrowPadding,
      arrowElement?.clientWidth,
      arrowElement?.clientHeight,
      panel.offsetWidth,
      panel.offsetHeight,
      win.innerWidth,
      win.innerHeight,
      win.getComputedStyle(panel).direction,
    ].join(',')
    if (next !== signature || arrowElement !== lastArrow) {
      signature = next
      lastArrow = arrowElement
      place()
    }
    frame = win.requestAnimationFrame(checkFrame)
  }
  const follow = () => {
    if (active && frame === undefined) checkFrame()
  }
  if (watchFrame) follow()

  return Object.assign(
    () => {
      if (!active) return
      active = false
      stop?.()
      if (frame !== undefined) win.cancelAnimationFrame(frame)
      restoreAttributes(savedPanel)
      if (savedArrow !== undefined) restoreAttributes(savedArrow)
      for (const { name, value, priority } of savedStyles) {
        panel.style.setProperty(name, value, priority)
      }
    },
    { place, follow },
  )
}
