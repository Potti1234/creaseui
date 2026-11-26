import { Mount, type View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { MountMap, type MapConfig, type MapMessage } from '../behaviors/map'

export { MapMessage, type MapConfig, type MapViewport } from '../behaviors/map'
export { OPENFREEMAP_STYLES } from '../behaviors/map-styles'

export const mapClasses = {
  root: 'relative h-[420px] min-h-64 w-full overflow-hidden bg-muted text-foreground',
  canvas: 'absolute inset-0',
  status:
    'absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-background/95 p-6 text-sm text-muted-foreground [&[hidden]]:hidden',
  controlGroup:
    'absolute z-20 flex flex-col overflow-hidden rounded-lg bg-background text-foreground shadow-md',
  control:
    'flex min-h-10 min-w-10 items-center justify-center px-2 text-lg font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring disabled:opacity-50 [&[hidden]]:hidden',
  marker:
    'group absolute z-10 flex min-h-10 min-w-10 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center border-0 bg-transparent p-0 text-foreground focus-visible:rounded-full focus-visible:outline-2 focus-visible:outline-ring',
  markerContent:
    'flex size-6 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground shadow-md ring-2 ring-background',
  label:
    'absolute top-full mt-1 whitespace-nowrap rounded-md bg-background px-2 py-1 text-xs text-foreground shadow-sm',
  tooltip:
    'pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover:block group-focus-visible:block',
  popup:
    'absolute z-20 w-60 max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-[calc(100%+20px)] rounded-lg bg-popover p-4 pe-10 text-sm text-popover-foreground shadow-lg',
  close:
    'absolute end-0 top-0 flex size-10 items-center justify-center rounded-lg text-lg text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring',
}
export type MapClasses = typeof mapClasses

export type MapProps<Msg, R = never> = MapConfig & {
  readonly key?: string
  readonly ariaLabel: string
  readonly toMessage: (message: MapMessage) => Msg
  readonly children?: View.Children<Msg, R>
  readonly className?: string
}

export const Map = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    key,
    ariaLabel,
    toMessage,
    children,
    className,
    ...config
  }: MapProps<NoInfer<Msg>, R>,
  styles: MapClasses = mapClasses,
) => {
  const root = h.div.class(styles.root, className).attrs({
    'data-slot': 'map',
    role: 'region',
    'aria-label': ariaLabel,
    'data-map-config': JSON.stringify(config),
  })
  return (key === undefined ? root : root.key(key))
    .onMount(Mount.map(MountMap(), toMessage))
    .children(
      h.div
        .key('map-canvas')
        .class(styles.canvas)
        .attr('data-slot', 'map-canvas')
        .style({ position: 'absolute', inset: '0' }),
      children,
      // The mount keeps references to the canvas and status while overlays change.
      h.div
        .key('map-status')
        .class(styles.status)
        .attrs({ 'data-slot': 'map-status', role: 'status' })
        .children(
          h.span.attr('data-slot', 'map-status-text'),
          h.button
            .class(styles.control)
            .attrs({ type: 'button', 'data-map-action': 'retry' }),
        ),
    )
}
