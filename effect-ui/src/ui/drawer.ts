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
type LayoutPart<Msg, R> = (
  children: View.Input<NoInfer<Msg>, R>,
  className?: string,
) => View.Content<NoInfer<Msg>, R>

export type DrawerLayoutParts<Msg, R = never> = {
  readonly drawer: DrawerParts
  readonly header: LayoutPart<Msg, R>
  readonly title: LayoutPart<Msg, R>
  readonly description: LayoutPart<Msg, R>
  readonly content: LayoutPart<Msg, R>
  readonly footer: LayoutPart<Msg, R>
  readonly close: (
    children?: View.Input<NoInfer<Msg>, R>,
    className?: string,
  ) => View.Content<NoInfer<Msg>, R>
  readonly initialFocus: DrawerParts['initialFocus']
}

export type DrawerViewOptions<Msg, R = never> = {
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
  readonly layout?: (
    parts: DrawerLayoutParts<Msg, R>,
  ) => View.Input<NoInfer<Msg>, R>
  readonly swipeArea?: PanelContent<Msg, R>
  readonly className?: string
  readonly panelStyle?: Html.Style
}

export type DrawerOptions<Msg, R = never> = Omit<
  Options<Msg>,
  'view' | 'fallback'
> &
  DrawerViewOptions<Msg, R>

const visuallyHidden: Html.Style = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
}

export const drawerLayout = <Msg, R>(
  h: Html.H<Msg>,
  drawer: DrawerParts,
  {
    title,
    description,
    content,
    footer,
    closeLabel = 'Close',
    layout,
  }: DrawerViewOptions<Msg, R>,
  styles: typeof drawerClasses,
  slot: string,
  labelled = true,
) => {
  let hasTitle = false
  let hasDescription = false
  const parts: DrawerLayoutParts<Msg, R> = {
    drawer,
    header: (children, className) =>
      h.div
        .class(styles.header, className)
        .attr('data-slot', `${slot}-header`)
        .children(children),
    title: (children, className) => {
      hasTitle = true
      const element = h.h2
        .class(styles.title, className)
        .attr('data-slot', `${slot}-title`)
      return (labelled ? drawer.title(element) : element).children(children)
    },
    description: (children, className) => {
      hasDescription = true
      const element = h.p
        .class(styles.description, className)
        .attr('data-slot', `${slot}-description`)
      return (labelled ? drawer.description(element) : element).children(
        children,
      )
    },
    content: (children, className) => {
      const element = h.div
        .class(styles.content, className)
        .attr('data-slot', `${slot}-body`)
      return (labelled ? drawer.content(element) : element).children(children)
    },
    footer: (children, className) =>
      h.div
        .class(styles.footer, className)
        .attr('data-slot', `${slot}-footer`)
        .children(children),
    close: (
      children = closeLabel === false ? 'Close' : closeLabel,
      className,
    ) => {
      const element = h.button
        .class(styles.close, className)
        .attr('data-slot', `${slot}-close`)
      return (
        labelled ? drawer.close(element) : element.attr('type', 'button')
      ).children(children)
    },
    initialFocus: labelled
      ? drawer.initialFocus
      : element => element.attr('autofocus', undefined),
  }
  if (layout === undefined) {
    return [
      parts.header([
        parts.title(title),
        description === undefined ? undefined : parts.description(description),
      ]),
      parts.content(content?.(drawer)),
      footer === undefined && closeLabel === false
        ? undefined
        : h.div
            .class(styles.footer)
            .attr('data-slot', `${slot}-footer`)
            .children(
              footer?.(drawer),
              closeLabel === false ? undefined : parts.close(),
            ),
    ]
  }

  const body = layout(parts)
  return [
    h.div.style({ display: 'contents' }).children(body),
    labelled && !hasTitle
      ? drawer.title(h.h2.style(visuallyHidden)).children(title)
      : undefined,
    labelled && !hasDescription && description !== undefined
      ? drawer.description(h.p.style(visuallyHidden)).children(description)
      : undefined,
  ]
}

export const Drawer = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    props,
    side = edges[props.swipeDirection ?? 'down'],
    onEmit,
    onFailure,
    key,
    ...viewOptions
  }: DrawerOptions<NoInfer<Msg>, R>,
  styles: typeof drawerClasses = drawerClasses,
  slot: 'drawer' | 'sheet' | 'mobile-nav' = 'drawer',
) =>
  DrawerBehavior(h, {
    ...(onEmit === undefined ? {} : { onEmit }),
    ...(onFailure === undefined ? {} : { onFailure }),
    ...(key === undefined ? {} : { key }),
    props: {
      ...props,
      swipeDirection: props.swipeDirection ?? swipeDirections[side],
    },
    view: drawer =>
      drawerView(h, drawer, { ...viewOptions, side }, styles, slot),
  })

export const drawerView = <Msg, R>(
  h: Html.H<Msg>,
  drawer: DrawerParts,
  {
    trigger,
    side = 'bottom',
    direction,
    showSwipeHandle = side === 'top' || side === 'bottom',
    swipeArea,
    className,
    panelStyle,
    ...layoutOptions
  }: DrawerViewOptions<Msg, R>,
  styles: typeof drawerClasses,
  slot: 'drawer' | 'sheet' | 'mobile-nav' | 'sheet-switcher',
  triggers?: View.Input<NoInfer<Msg>, R>,
  body?: (drawer: DrawerParts) => View.Input<NoInfer<Msg>, R>,
) =>
  h.div.attrs({ 'data-slot': `${slot}-root`, dir: direction }).children(
    trigger === undefined ? undefined : drawer.trigger(trigger),
    triggers,
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
              body === undefined
                ? drawerLayout(h, drawer, layoutOptions, styles, slot)
                : body(drawer),
            ),
        ),
    ),
  )
