import { HoverIntent } from '@foldkit/ui'
import { Effect } from 'effect'

export const Model = HoverIntent.Model
export const Message = HoverIntent.Message
export const OutMessage = HoverIntent.OutMessage
export const init = HoverIntent.init
export const update = HoverIntent.update
export const close = HoverIntent.close
export const view = HoverIntent.view

export type Model = HoverIntent.Model
export type Message = HoverIntent.Message
export type OutMessage = HoverIntent.OutMessage
export type InitConfig = HoverIntent.InitConfig
export type RenderInfo = HoverIntent.RenderInfo
export type ViewInputs = HoverIntent.ViewInputs

type Point = Readonly<{ x: number; y: number }>
type Bounds = Readonly<
  Pick<DOMRectReadOnly, 'left' | 'right' | 'top' | 'bottom'>
>

const cross = (origin: Point, a: Point, b: Point): number =>
  (a.x - origin.x) * (b.y - origin.y) - (a.y - origin.y) * (b.x - origin.x)

const hullHalf = (points: ReadonlyArray<Point>): ReadonlyArray<Point> => {
  const half: Array<Point> = []
  for (const point of points) {
    while (half.length >= 2 && cross(half.at(-2)!, half.at(-1)!, point) <= 0) {
      half.pop()
    }
    half.push(point)
  }
  return half.slice(0, -1)
}

export const bridgeBetween = (trigger: Bounds, panel: Bounds) => {
  const padding = 4
  const points = [trigger, panel]
    .flatMap(({ left, right, top, bottom }) =>
      [left - padding, right + padding].flatMap(x =>
        [top - padding, bottom + padding].map(y => ({ x, y })),
      ),
    )
    .sort((a, b) => a.x - b.x || a.y - b.y)
  const hull = [...hullHalf(points), ...hullHalf(points.reverse())]
  return (point: Point): boolean =>
    hull.every(
      (from, index) =>
        cross(from, hull[(index + 1) % hull.length]!, point) >= 0,
    )
}

export const watchPointerDeparture = (
  region: HTMLElement,
  trigger: Element | null,
  panel: Element,
  departed: () => void,
) =>
  Effect.acquireRelease(
    Effect.sync(() => {
      const owner = region.ownerDocument
      const lifecycle = new AbortController()
      let transit: AbortController | undefined
      const stopWatching = () => transit?.abort()
      const leave = () => {
        stopWatching()
        departed()
      }
      const onLeave = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return
        stopWatching()
        if (trigger === null || event.relatedTarget === null) {
          leave()
          return
        }
        const inside = bridgeBetween(
          trigger.getBoundingClientRect(),
          panel.getBoundingClientRect(),
        )
        const isInside = (pointer: PointerEvent) =>
          inside({ x: pointer.clientX, y: pointer.clientY })
        if (!isInside(event)) {
          leave()
          return
        }
        transit = new AbortController()
        const options = { signal: transit.signal, capture: true }
        owner.addEventListener(
          'pointermove',
          move => {
            if (move.pointerId === event.pointerId && !isInside(move)) leave()
          },
          options,
        )
        const onEnd = (end: PointerEvent) => {
          if (end.pointerId === event.pointerId) leave()
        }
        owner.addEventListener('pointercancel', onEnd, options)
        owner.documentElement.addEventListener('pointerleave', onEnd, {
          signal: transit.signal,
        })
      }
      region.addEventListener('pointerleave', onLeave, {
        signal: lifecycle.signal,
      })
      region.addEventListener('pointerenter', stopWatching, {
        signal: lifecycle.signal,
      })
      return () => {
        stopWatching()
        lifecycle.abort()
      }
    }),
    cleanup => Effect.sync(cleanup),
  )
