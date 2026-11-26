import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { ToolbarBehavior, type ToolbarParts } from '../behaviors/toolbar'

type Options<Msg> = Parameters<typeof ToolbarBehavior<Msg>>[1]
type SlotName = 'start' | 'center' | 'end'
type Divider = 'top' | 'bottom' | 'start' | 'end'

const tailwind = {
  root: 'flex min-w-0 flex-wrap items-center px-4 data-[variant=muted]:bg-muted data-[variant=surface]:bg-card data-[variant=surface]:text-card-foreground data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-centered:grid data-centered:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] data-centered:data-[orientation=vertical]:grid-cols-1 data-[size=sm]:min-h-8 data-[size=md]:min-h-9 data-[size=lg]:min-h-10',
  slot: 'flex min-w-0 items-center gap-(--toolbar-gap) data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
  start: 'has-[>[data-crease-edge-comp]:first-child]:-ms-2',
  center: 'justify-center overflow-hidden',
  end: 'ms-auto justify-end has-[>[data-crease-edge-comp]:last-child]:-me-2',
}

type ToolbarContent<Msg, R> = (
  toolbar: ToolbarParts,
) => View.Input<NoInfer<Msg>, R>

export const Toolbar = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    label,
    startContent,
    centerContent,
    endContent,
    gap = 1,
    size = 'md',
    variant = 'transparent',
    dividers = [],
    className,
    direction,
    ...options
  }: Omit<Options<Msg>, 'view' | 'fallback'> & {
    readonly label: string
    readonly startContent?: ToolbarContent<Msg, R>
    readonly centerContent?: ToolbarContent<Msg, R>
    readonly endContent?: ToolbarContent<Msg, R>
    readonly gap?: number
    readonly size?: 'sm' | 'md' | 'lg'
    readonly variant?: 'transparent' | 'surface' | 'muted'
    readonly dividers?: readonly Divider[]
    readonly className?: string
    readonly direction?: 'ltr' | 'rtl'
  },
  styles: typeof tailwind = tailwind,
) =>
  ToolbarBehavior(h, {
    ...options,
    view: toolbar => {
      const border = '1px solid var(--border)'
      const slot = (
        name: SlotName,
        render: ToolbarContent<Msg, R> | undefined,
      ) =>
        render === undefined && centerContent === undefined
          ? undefined
          : h.div
              .class(styles.slot, styles[name])
              .attrs({
                'data-slot': `toolbar-${name}`,
                'data-orientation': toolbar.orientation,
              })
              .children(render?.(toolbar))
      return toolbar
        .root(
          h.div
            .class(styles.root, className)
            .attrs({
              'data-slot': 'toolbar',
              'aria-label': label,
              dir: direction,
              'data-size': size,
              'data-variant': variant,
              'data-centered': centerContent === undefined ? undefined : '',
            })
            .style({
              '--toolbar-gap': `${gap * 4}px`,
              borderTop: dividers.includes('top') ? border : undefined,
              borderBottom: dividers.includes('bottom') ? border : undefined,
              borderInlineStart: dividers.includes('start')
                ? border
                : undefined,
              borderInlineEnd: dividers.includes('end') ? border : undefined,
            }),
        )
        .children(
          slot('start', startContent),
          slot('center', centerContent),
          slot('end', endContent),
        )
    },
  })
