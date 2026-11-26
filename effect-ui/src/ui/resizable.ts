import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  ResizableBehavior,
  type ResizeOrientation,
} from '../behaviors/resizable'

type Options<Msg> = Parameters<typeof ResizableBehavior<Msg>>[1]
type Pane<Msg, R> = {
  readonly key: string
  readonly label?: string
  readonly content: View.Input<Msg, R>
  readonly resizeAfter?: boolean
}
export type ResizableProps<Msg, R = never> = Omit<
  Options<Msg>,
  'props' | 'view' | 'fallback'
> & {
  readonly props?: Omit<Options<Msg>['props'], 'count'>
  readonly id: string
  readonly panels: readonly Pane<Msg, R>[]
  readonly orientation?: ResizeOrientation
  readonly direction?: 'ltr' | 'rtl'
  readonly label?: string
  readonly withHandle?: boolean
  readonly className?: string
}

const tailwind = {
  root: 'grid h-full min-h-0 w-full min-w-0 overflow-hidden rounded-md border data-dragging:select-none',
  panel: 'min-h-0 min-w-0 overflow-auto overscroll-contain',
  handle:
    'relative grid min-h-0 min-w-0 touch-none place-items-center bg-border outline-none focus-visible:ring-2 focus-visible:ring-ring data-[direction=horizontal]:cursor-col-resize data-[direction=vertical]:cursor-row-resize aria-disabled:cursor-default',
  grip: 'z-10 grid h-5 w-3 place-items-center rounded border border-border bg-background text-xs text-muted-foreground data-[direction=vertical]:h-3 data-[direction=vertical]:w-5',
}
export const ResizableGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    panels,
    props,
    orientation = props?.orientation ?? 'horizontal',
    direction,
    label = 'Resizable panels',
    withHandle,
    className,
    ...options
  }: ResizableProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) =>
  ResizableBehavior(h, {
    ...options,
    key: options.key ?? id,
    props: { ...props, count: panels.length, orientation },
    view: resizable => {
      const vertical = orientation === 'vertical'
      const tracks = resizable.sizes
        .map(size => `minmax(0, ${size}fr)`)
        .join(' 4px ')
      return resizable
        .root(
          h.div
            .class(styles.root, className)
            .attrs({
              id,
              role: 'group',
              'aria-label': label,
              dir: direction,
              'data-slot': 'resizable-panel-group',
              'data-dragging': resizable.dragging ? '' : undefined,
            })
            .style({
              gridTemplateColumns: vertical ? undefined : tracks,
              gridTemplateRows: vertical ? tracks : undefined,
            }),
        )
        .children(
          panels.flatMap(
            ({ key, label, content, resizeAfter = true }, index) => {
              const panelId = `${id}-panel-${index}`
              const size = resizable.sizes[index] ?? 0
              const pair = size + (resizable.sizes[index + 1] ?? 0)
              const minimum = Math.min(
                Math.max(0, props?.minSize ?? 10),
                pair / 2,
              )
              return [
                h.div
                  .key(key)
                  .class(styles.panel)
                  .attrs({
                    id: panelId,
                    'data-slot': 'resizable-panel',
                    'aria-label': label,
                  })
                  .children(content),
                index === panels.length - 1
                  ? undefined
                  : h.div
                      .key(`handle-${index}`)
                      .class(styles.handle)
                      .attrs({
                        role: 'separator',
                        tabindex: resizeAfter ? '0' : '-1',
                        'aria-disabled': resizeAfter ? undefined : 'true',
                        'aria-label':
                          label === undefined
                            ? `Resize panel ${index + 1}`
                            : `Resize ${label}`,
                        'aria-controls': panelId,
                        'aria-orientation': vertical
                          ? 'horizontal'
                          : 'vertical',
                        'aria-valuemin': String(Math.round(minimum)),
                        'aria-valuemax': String(Math.round(pair - minimum)),
                        'aria-valuenow': String(Math.round(size)),
                        'data-slot': 'resizable-handle',
                        'data-direction': orientation,
                        'data-handle': String(index),
                      })
                      .children(
                        withHandle
                          ? h.span
                              .class(styles.grip)
                              .attrs({
                                'aria-hidden': 'true',
                                'data-direction': orientation,
                              })
                              .children(vertical ? '···' : '⋮')
                          : undefined,
                      ),
              ]
            },
          ),
        )
    },
  })
export const Resizable = ResizableGroup
