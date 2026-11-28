import type { Html } from '@effect/ui/html'

import { MobileNavPosition, type MobileNavSide } from '../behaviors/mobile-nav'
import { Drawer, drawerClasses, type DrawerOptions } from './drawer'

export type MobileNavProps<Msg, R = never> = Omit<
  DrawerOptions<Msg, R>,
  'side' | 'panelStyle' | 'showSwipeHandle'
> & {
  readonly side?: MobileNavSide
  readonly width?: number
}

export const MobileNav = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    side = 'auto',
    width = 320,
    direction = 'ltr',
    trigger,
    ...options
  }: MobileNavProps<NoInfer<Msg>, R>,
  styles: typeof drawerClasses = drawerClasses,
) =>
  MobileNavPosition(h, {
    key: options.key ?? options.title,
    props: { side, direction },
    view: nav =>
      nav
        .root(h.div.attrs({ 'data-slot': 'mobile-nav-shell', dir: direction }))
        .children(
          Drawer(
            h,
            {
              ...options,
              props: { ...options.props, swipeDirection: nav.edge },
              direction,
              side: nav.edge,
              showSwipeHandle: false,
              panelStyle: { maxWidth: `min(100vw, ${Math.max(0, width)}px)` },
              ...(trigger === undefined
                ? {}
                : { trigger: trigger.attr('data-slot', 'mobile-nav-toggle') }),
            },
            styles,
            'mobile-nav',
          ),
        ),
  })
