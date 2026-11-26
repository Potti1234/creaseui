import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  DrawerBehavior,
  type DrawerParts,
  type DrawerSwipeDirection,
} from '../behaviors/drawer'

type Options<Msg> = Parameters<typeof DrawerBehavior<Msg>>[1]
export type DrawerSide = 'top' | 'right' | 'bottom' | 'left'

const swipeDirections = {
  bottom: 'down',
  top: 'up',
  left: 'left',
  right: 'right',
} satisfies Record<DrawerSide, DrawerSwipeDirection>
const edges = {
  down: 'bottom',
  up: 'top',
  left: 'left',
  right: 'right',
} satisfies Record<DrawerSwipeDirection, DrawerSide>

const translated = {
  top: {
    open: '0 calc(var(--drawer-swipe-movement-y, 0px) - var(--drawer-snap-point-offset, 0px))',
    exit: '0 -100%',
  },
  bottom: {
    open: '0 calc(var(--drawer-swipe-movement-y, 0px) + var(--drawer-snap-point-offset, 0px))',
    exit: '0 100%',
  },
  left: { open: 'var(--drawer-swipe-movement-x, 0px) 0', exit: '-100% 0' },
  right: { open: 'var(--drawer-swipe-movement-x, 0px) 0', exit: '100% 0' },
}

export const drawerClasses = {
  backdrop:
    'fixed inset-0 bg-black/50 opacity-[calc(1_-_var(--drawer-swipe-progress,0))] transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0 data-swiping:transition-none motion-reduce:transition-none',
  viewport:
    'fixed inset-0 flex pb-[var(--drawer-keyboard-inset,0px)] data-[side=top]:items-start data-[side=bottom]:items-end data-[side=left]:justify-start data-[side=right]:justify-end',
  popup:
    'relative grid min-h-0 max-h-dvh w-full gap-4 overflow-hidden border bg-background p-5 text-foreground shadow-lg outline-none [translate:var(--crease-drawer-translate)] transition-[translate] duration-[calc(var(--drawer-swipe-strength,1)*320ms)] data-starting-style:[translate:var(--crease-drawer-exit)] data-ending-style:[translate:var(--crease-drawer-exit)] data-swiping:transition-none motion-reduce:transition-none data-[side=top]:rounded-b-xl data-[side=bottom]:rounded-t-xl data-[side=left]:h-full data-[side=left]:max-w-sm data-[side=right]:h-full data-[side=right]:max-w-sm',
  handle: 'mx-auto h-1.5 w-12 rounded-full bg-muted-foreground/45',
  header: 'grid gap-1.5',
  title: 'text-lg font-semibold',
  description: 'text-sm text-muted-foreground',
  content: 'min-h-0 overflow-auto overscroll-contain',
  footer: 'flex flex-wrap justify-end gap-2',
  close:
    'h-8 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring',
}

type PanelContent<Msg, R> = (parts: DrawerParts) => View.Input<NoInfer<Msg>, R>

export type DrawerOptions<Msg, R = never> = Omit<
  Options<Msg>,
  'view' | 'fallback'
> & {
  readonly trigger?: Html.Element<
    Msg,
    R,
    Html.EventsOf<'button'>,
    HTMLButtonElement,
    'button'
  >
  readonly title: string
  readonly description?: string
  readonly side?: DrawerSide
  readonly direction?: 'ltr' | 'rtl'
  readonly showSwipeHandle?: boolean
  readonly closeLabel?: string | false
  readonly content?: PanelContent<Msg, R>
  readonly footer?: PanelContent<Msg, R>
  readonly swipeArea?: PanelContent<Msg, R>
  readonly className?: string
  readonly panelStyle?: Html.Style
}

export const Drawer = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    props,
    trigger,
    title,
    description,
    side = edges[props.swipeDirection ?? 'down'],
    direction,
    showSwipeHandle = side === 'top' || side === 'bottom',
    closeLabel = 'Close',
    content,
    footer,
    swipeArea,
    className,
    panelStyle,
    ...options
  }: DrawerOptions<NoInfer<Msg>, R>,
  styles: typeof drawerClasses = drawerClasses,
  slot: 'drawer' | 'sheet' | 'mobile-nav' = 'drawer',
) =>
  DrawerBehavior(h, {
    ...options,
    props: {
      ...props,
      swipeDirection: props.swipeDirection ?? swipeDirections[side],
    },
    view: drawer =>
      h.div.attrs({ 'data-slot': `${slot}-root`, dir: direction }).children(
        trigger === undefined ? undefined : drawer.trigger(trigger),
        swipeArea?.(drawer),
        drawer.portal(h.dialog.attr('data-slot', slot))?.children(
          drawer.backdrop(
            h.div.class(styles.backdrop).attr('data-slot', `${slot}-overlay`),
          ),
          drawer
            .viewport(h.div.class(styles.viewport).attr('data-side', side))
            .children(
              drawer
                .popup(
                  h.div
                    .class(styles.popup, className)
                    .attrs({
                      'data-side': side,
                      'data-slot': `${slot}-content`,
                    })
                    .style({
                      ...panelStyle,
                      '--crease-drawer-translate': translated[side].open,
                      '--crease-drawer-exit': translated[side].exit,
                    }),
                )
                .children(
                  showSwipeHandle
                    ? h.div.class(styles.handle).attrs({
                        'aria-hidden': 'true',
                        'data-slot': `${slot}-handle`,
                      })
                    : undefined,
                  h.div
                    .class(styles.header)
                    .attr('data-slot', `${slot}-header`)
                    .children(
                      drawer
                        .title(
                          h.h2
                            .class(styles.title)
                            .attr('data-slot', `${slot}-title`),
                        )
                        .children(title),
                      description === undefined
                        ? undefined
                        : drawer
                            .description(
                              h.p
                                .class(styles.description)
                                .attr('data-slot', `${slot}-description`),
                            )
                            .children(description),
                    ),
                  drawer
                    .content(
                      h.div
                        .class(styles.content)
                        .attr('data-slot', `${slot}-body`),
                    )
                    .children(content?.(drawer)),
                  footer === undefined && closeLabel === false
                    ? undefined
                    : h.div
                        .class(styles.footer)
                        .attr('data-slot', `${slot}-footer`)
                        .children(
                          footer?.(drawer),
                          closeLabel === false
                            ? undefined
                            : drawer
                                .close(h.button.class(styles.close))
                                .children(closeLabel),
                        ),
                ),
            ),
        ),
      ),
  })
