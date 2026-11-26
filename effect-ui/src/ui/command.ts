import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  CommandBehavior,
  commandLabelSegments,
  type CommandItem,
} from '../behaviors/command'
import { IconBehavior } from '../behaviors/icon'

type Options<Msg> = Parameters<typeof CommandBehavior<Msg>>[1]
export type CommandProps<Msg, R = never> = Omit<
  Options<Msg>,
  'view' | 'fallback'
> & {
  readonly label?: string
  readonly placeholder?: string
  readonly emptyContent?: View.Input<Msg, R>
  readonly loadingContent?: View.Input<Msg, R>
  readonly moreResultsContent?: (
    visible: number,
    total: number,
  ) => View.Input<Msg, R>
  readonly groupHeading?: (group: string) => View.Input<Msg, R>
  readonly decorateItem?: (item: CommandItem) => {
    readonly leadingContent?: View.Input<Msg, R>
    readonly content?: View.Input<Msg, R>
    readonly shortcut?: View.Input<Msg, R>
    readonly keys?: string
    readonly className?: string
  }
  readonly className?: string
}

const tailwind = {
  root: 'flex w-full min-w-0 flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
  inputGroup: 'flex min-w-0 items-center gap-2 border-b px-3',
  input:
    'h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50',
  searchIcon: 'size-4 shrink-0 text-muted-foreground',
  list: 'max-h-[300px] overflow-x-hidden overflow-y-auto p-1',
  group: 'overflow-hidden text-foreground',
  groupHeading: 'px-2 py-1.5 text-xs font-medium text-muted-foreground',
  separator: '-mx-1 h-px bg-border',
  item: 'relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50',
  label: 'min-w-0 flex-1',
  match: 'bg-transparent font-semibold text-inherit',
  shortcut: 'ms-auto shrink-0 text-xs tracking-widest text-muted-foreground',
  empty: 'px-2 py-6 text-center text-sm text-muted-foreground',
  more: 'px-3 py-2 text-xs text-muted-foreground',
  live: 'sr-only',
}

export const Command = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    label = 'Search commands',
    placeholder,
    emptyContent = 'No results found.',
    loadingContent = 'Loading…',
    moreResultsContent,
    groupHeading,
    decorateItem,
    className,
    ...options
  }: CommandProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => {
  const config = new Map(options.props.items.map(item => [item.value, item]))
  return CommandBehavior(h, {
    ...options,
    view: ({ combobox, query, status, visible, total }) =>
      h.div
        .class(styles.root, className)
        .attrs({ 'data-slot': 'command', dir: options.props.dir })
        .children(
          combobox
            .inputGroup(
              h.div
                .class(styles.inputGroup)
                .attr('data-slot', 'command-input-wrapper'),
            )
            .children(
              IconBehavior(h, {
                name: 'search',
                size: 'sm',
                className: styles.searchIcon,
              }),
              combobox.input(
                h.input.class(styles.input).attrs({
                  'data-slot': 'command-input',
                  'aria-label': label,
                  placeholder,
                }),
              ),
            ),
          combobox
            .list(
              h.div.class(styles.list).attrs({
                'data-slot': 'command-list',
                'aria-label': label,
                'aria-busy': status === 'loading' ? 'true' : undefined,
              }),
            )
            .children(
              combobox.groups
                .map(({ key, items }, index) => {
                  const contents = items.map(item => {
                    const visual = decorateItem?.(
                      config.get(item.value) ?? item,
                    )
                    return combobox
                      .item({
                        element: h.div
                          .key(item.value)
                          .class(styles.item, visual?.className)
                          .attrs({
                            'data-slot': 'command-item',
                            'aria-keyshortcuts': visual?.keys,
                          }),
                        value: item.value,
                      })
                      .children(
                        visual?.leadingContent,
                        h.span
                          .class(styles.label)
                          .children(
                            visual?.content ??
                              commandLabelSegments(item.label, query).map(
                                segment =>
                                  segment.match
                                    ? h.mark
                                        .class(styles.match)
                                        .children(segment.text)
                                    : segment.text,
                              ),
                          ),
                        visual?.shortcut === undefined
                          ? undefined
                          : h.span
                              .class(styles.shortcut)
                              .attrs({
                                'data-slot': 'command-shortcut',
                                'aria-hidden':
                                  visual.keys === undefined
                                    ? undefined
                                    : 'true',
                              })
                              .children(visual.shortcut),
                      )
                  })
                  return key === undefined
                    ? contents
                    : h.div
                        .key(`group:${index}`)
                        .class(styles.group)
                        .children(
                          index === 0
                            ? undefined
                            : h.div
                                .class(styles.separator)
                                .attr('role', 'separator'),
                          combobox
                            .group({
                              element: h.div.attr('data-slot', 'command-group'),
                              group: key,
                            })
                            .children(
                              combobox
                                .groupLabel({
                                  element: h.div
                                    .class(styles.groupHeading)
                                    .attr('data-slot', 'command-group-heading'),
                                  group: key,
                                })
                                .children(groupHeading?.(key) ?? key),
                              contents,
                            ),
                        )
                })
                .flat(),
            ),
          visible === 0
            ? h.div
                .class(styles.empty)
                .attrs({ 'data-slot': 'command-empty', role: 'status' })
                .children(status === 'loading' ? loadingContent : emptyContent)
            : undefined,
          total > visible
            ? h.div
                .class(styles.more)
                .attr('data-slot', 'command-more')
                .children(
                  moreResultsContent?.(visible, total) ??
                    `Showing ${visible} of ${total} results`,
                )
            : undefined,
          h.span
            .class(styles.live)
            .attrs({ 'aria-live': 'polite', 'aria-atomic': 'true' })
            .children(
              query.trim() && visible > 0
                ? `${total} ${total === 1 ? 'result' : 'results'}`
                : '',
            ),
        ),
  })
}

export const CommandPalette = Command
