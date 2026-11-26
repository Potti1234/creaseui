import type { Component, View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  SheetSwitcherBehavior,
  type SheetSwitcherBehaviorProps,
} from '../behaviors/sheet'
import {
  Drawer,
  drawerClasses,
  drawerLayout,
  drawerView,
  type DrawerLayoutParts,
  type DrawerOptions,
  type DrawerViewOptions,
} from './drawer'
import './sheet.css'

export type SheetProps<Msg, R = never> = DrawerOptions<Msg, R>
export type SheetLayoutParts<Msg, R = never> = DrawerLayoutParts<Msg, R>

export const Sheet = <Msg, R = never>(
  h: Html.H<Msg>,
  options: SheetProps<NoInfer<Msg>, R>,
  styles: typeof drawerClasses = drawerClasses,
) => {
  const side = options.side ?? 'right'
  return Drawer(
    h,
    {
      closeLabel: side === 'bottom' ? false : 'Close',
      ...options,
      side,
    },
    styles,
    'sheet',
  )
}

type SwitcherParts = Component.Headless.Parts<typeof SheetSwitcherBehavior>
export type SheetSwitcherLayoutParts<Msg, R = never> = DrawerLayoutParts<
  Msg,
  R
> & {
  readonly select: SwitcherParts['select']
}
export type SheetSwitcherPane<Msg, R = never> = Pick<
  DrawerViewOptions<Msg, R>,
  | 'title'
  | 'description'
  | 'content'
  | 'footer'
  | 'closeLabel'
  | 'trigger'
  | 'panelStyle'
> &
  SheetSwitcherBehaviorProps['sheets'][number] & {
    readonly layout?: (
      parts: SheetSwitcherLayoutParts<Msg, R>,
    ) => View.Input<NoInfer<Msg>, R>
  }
type SwitcherOptions<Msg> = Parameters<typeof SheetSwitcherBehavior<Msg>>[1]
export type SheetSwitcherProps<Msg, R = never> = Omit<
  SwitcherOptions<Msg>,
  'view' | 'fallback' | 'props'
> &
  Pick<
    DrawerViewOptions<Msg, R>,
    'className' | 'direction' | 'panelStyle' | 'showSwipeHandle'
  > & {
    readonly props?: Omit<SheetSwitcherBehaviorProps, 'sheets'>
    readonly sheets: ReadonlyArray<SheetSwitcherPane<Msg, R>>
  }

export const SheetSwitcher = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    props,
    sheets,
    className,
    direction,
    panelStyle,
    showSwipeHandle,
    ...options
  }: SheetSwitcherProps<NoInfer<Msg>, R>,
  styles: typeof drawerClasses = drawerClasses,
) =>
  SheetSwitcherBehavior(h, {
    ...options,
    props: {
      ...props,
      sheets: sheets.map(({ id, snapPoints, purpose }) => ({
        id,
        snapPoints,
        purpose,
      })),
    },
    view: switcher => {
      const { drawer, renderedId, previousId } = switcher
      const active = sheets.find(sheet => sheet.id === renderedId)
      const previous = sheets.find(sheet => sheet.id === previousId)
      const renderPane = (
        sheet: SheetSwitcherPane<Msg, R>,
        retained: boolean,
      ) => {
        const { layout, ...paneOptions } = sheet
        const layoutOptions: DrawerViewOptions<Msg, R> = {
          ...paneOptions,
          closeLabel: sheet.closeLabel ?? false,
          ...(layout === undefined
            ? {}
            : {
                layout: parts => layout({ ...parts, select: switcher.select }),
              }),
        }
        return switcher
          .pane(
            h.div.key(sheet.id).attrs({
              'data-slot': 'sheet-switcher-panel',
              'data-sheet-id': sheet.id,
              'data-retained': retained ? '' : undefined,
              'data-switching':
                !retained && previous !== undefined ? '' : undefined,
              tabindex: '-1',
              inert: retained ? '' : undefined,
              'aria-hidden': retained ? 'true' : undefined,
            }),
            retained,
          )
          .children(
            drawerLayout(h, drawer, layoutOptions, styles, 'sheet', !retained),
          )
      }
      return switcher
        .observe(h.div.attr('data-slot', 'sheet-switcher-controller'))
        .children(
          drawerView(
            h,
            drawer,
            {
              title: active?.title ?? '',
              side: 'bottom',
              ...(className === undefined ? {} : { className }),
              ...(direction === undefined ? {} : { direction }),
              panelStyle: { ...panelStyle, ...active?.panelStyle },
              ...(showSwipeHandle === undefined ? {} : { showSwipeHandle }),
            },
            styles,
            'sheet-switcher',
            sheets.map(({ id, trigger }) =>
              trigger === undefined
                ? undefined
                : drawer.trigger(trigger.attr('id', switcher.triggerId(id))),
            ),
            () => [
              previous === undefined || previous === active
                ? undefined
                : renderPane(previous, true),
              active === undefined ? undefined : renderPane(active, false),
            ],
          ),
        )
    },
  })
