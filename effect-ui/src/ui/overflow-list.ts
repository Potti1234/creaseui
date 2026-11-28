import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  OverflowListBehavior,
  spacingToPx,
  type SpacingStep,
} from '../behaviors/overflow-list'

type Options<Msg> = Parameters<typeof OverflowListBehavior<Msg>>[1]

export type OverflowListItem<Msg, R = never> = {
  readonly item: View.Content<Msg, R> | string
  readonly index: number
}

export type OverflowListProps<Msg, R = never> = Omit<
  Options<Msg>,
  'props' | 'view' | 'fallback'
> & {
  readonly props?: Omit<Options<Msg>['props'], 'itemCount' | 'gap'> & {
    readonly gap?: SpacingStep
  }
  readonly items?: readonly {
    readonly key: string
    readonly content: View.Content<Msg, R> | string
  }[]
  readonly overflowRenderer?: (
    overflowItems: readonly OverflowListItem<Msg, R>[],
  ) => View.Input<Msg, R>
  readonly className?: string
}

const tailwind = {
  root: 'relative flex w-full min-w-0 items-center overflow-hidden whitespace-nowrap data-multiline:flex-wrap data-multiline:content-start',
  item: 'inline-flex w-max flex-none',
  indicator: 'inline-flex w-max flex-none',
  hidden: 'pointer-events-none invisible absolute start-0 top-0',
}

export const OverflowList = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    props: { gap = 2, ...props } = {},
    items = [],
    overflowRenderer,
    className,
    ...options
  }: OverflowListProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) =>
  OverflowListBehavior(h, {
    ...options,
    props: { ...props, gap: spacingToPx[gap], itemCount: items.length },
    view: list => {
      const hiddenIndices = new Set(list.hiddenIndices)
      const overflowItems = list.hiddenIndices.flatMap(index => {
        const item = items[index]
        return item === undefined ? [] : [{ item: item.content, index }]
      })
      const collapsed = overflowItems.length > 0
      const indicator =
        overflowRenderer === undefined
          ? undefined
          : h.div
              .class(styles.indicator, collapsed ? undefined : styles.hidden)
              .attrs({
                'data-overflow-indicator': '',
                'aria-hidden': collapsed ? undefined : 'true',
                inert: collapsed ? undefined : '',
              })
              .children(
                overflowRenderer(
                  collapsed
                    ? overflowItems
                    : items.map(({ content }, index) => ({
                        item: content,
                        index,
                      })),
                ),
              )
      return list
        .root(
          h.div
            .class(styles.root, className)
            .attrs({
              'data-slot': 'overflow-list',
              'data-rows': String(list.rows),
            })
            .style({
              gap: `${list.gap}px`,
              maxHeight:
                list.maxRows > 1 && list.rowHeight > 0
                  ? `${list.maxRows * list.rowHeight + (list.maxRows - 1) * list.gap}px`
                  : undefined,
            }),
        )
        .children(
          list.collapseFrom === 'start' ? indicator : undefined,
          items.map(({ key, content }, index) => {
            const hidden = hiddenIndices.has(index)
            return h.div
              .key(key)
              .class(styles.item, hidden ? styles.hidden : undefined)
              .attrs({
                'data-overflow-item': '',
                'aria-hidden': hidden ? 'true' : undefined,
                inert: hidden ? '' : undefined,
              })
              .children(content)
          }),
          list.collapseFrom === 'end' ? indicator : undefined,
        )
    },
  })
