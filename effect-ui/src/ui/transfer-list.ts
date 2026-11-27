import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { IconBehavior } from '../behaviors/icon'
import {
  TransferListBehavior,
  transferListMovableRange,
  type TransferListOption,
} from '../behaviors/transfer-list'
export type { TransferListOption } from '../behaviors/transfer-list'

type Options<Msg> = Parameters<typeof TransferListBehavior<Msg>>[1]
export type TransferListProps<Msg, R = never> = Omit<
  Options<Msg>,
  'view' | 'fallback'
> & {
  readonly label: string
  readonly labelHidden?: boolean
  readonly description?: string
  readonly selectedLabel?: string
  readonly availableLabel?: string
  readonly searchLabel?: string
  readonly searchPlaceholder?: string
  readonly showSelectAll?: boolean
  readonly showClear?: boolean
  readonly selectedEmptyText?: string
  readonly availableEmptyText?: string
  readonly noResultsText?: string
  readonly renderOption?: (option: TransferListOption) => View.Input<Msg, R>
  readonly className?: string
}

const tailwind = {
  root: '@container/transfer flex w-full min-w-0 flex-col gap-0 text-sm',
  hidden: 'sr-only',
  label: 'block px-3 text-sm leading-5 font-medium',
  description: 'block px-3 text-xs leading-5 text-muted-foreground',
  searchWrap: 'relative m-3 min-w-0',
  search:
    'h-9 w-full min-w-0 rounded-md border bg-background ps-8 pe-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40',
  searchIcon:
    'pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground',
  clearSearch:
    'absolute end-1 top-1/2 inline-grid size-7 -translate-y-1/2 place-items-center rounded-md border-0 bg-transparent text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
  panels: 'grid min-w-0 grid-cols-1 gap-0 @min-[40rem]/transfer:grid-cols-2',
  panel:
    'flex min-w-0 flex-col overflow-hidden outline-offset-0 focus-visible:-outline-offset-2',
  header:
    'flex items-center justify-between gap-2 border-b border-border px-3 py-2 @max-[40rem]/transfer:bg-background',
  heading: 'text-sm leading-5 font-medium text-muted-foreground',
  bulk: 'rounded-sm border-0 bg-transparent px-1.5 py-1 text-xs font-medium text-primary outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40',
  list: 'm-0 flex min-h-48 max-h-80 list-none flex-col overflow-y-auto overscroll-contain p-0',
  groupLabel:
    'mt-1 px-3 py-1 text-sm leading-5 font-bold text-foreground first:mt-0',
  row: 'flex min-w-0 items-center gap-2 px-3 py-1.5 text-sm data-grabbed:bg-accent data-[drop=before]:shadow-[inset_0_2px_var(--ring)] data-[drop=after]:shadow-[inset_0_-2px_var(--ring)]',
  option: 'min-w-0 flex-1 truncate',
  action:
    'inline-grid size-6 shrink-0 place-items-center rounded-md border-0 bg-transparent text-muted-foreground outline-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-40',
  empty:
    'flex min-h-48 items-center justify-center p-4 text-center text-xs leading-5 text-muted-foreground',
}

export const TransferList = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    label,
    labelHidden,
    description,
    selectedLabel = 'Selected',
    availableLabel = 'Available',
    searchLabel = `Search ${label}`,
    searchPlaceholder = 'Search…',
    showSelectAll,
    showClear,
    selectedEmptyText = 'No selected items.',
    availableEmptyText = 'No available items.',
    noResultsText = 'No matching items.',
    renderOption,
    className,
    ...options
  }: TransferListProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => {
  const {
    id,
    value,
    options: catalog,
    reorderable = true,
    hasSearch,
  } = options.props
  const instructions = `${id}-reorder-instructions`
  return TransferListBehavior(h, {
    ...options,
    key: options.key ?? id,
    view: list => {
      const panel = (
        side: 'selected' | 'available',
        title: string,
        items: readonly TransferListOption[],
        empty: string,
      ) => {
        const selected = side === 'selected'
        const groups = new Map<string | undefined, TransferListOption[]>()
        for (const item of items) {
          const key = selected ? undefined : item.group
          const group = groups.get(key)
          if (group === undefined) groups.set(key, [item])
          else group.push(item)
        }
        return h.section
          .class(
            styles.panel,
            selected
              ? undefined
              : 'border-t border-border @min-[40rem]/transfer:border-t-0 @min-[40rem]/transfer:border-l',
          )
          .attrs({
            'data-slot': `transfer-list-${side}`,
            'aria-labelledby': `${id}-${side}-headline`,
            role: 'group',
            tabindex: '-1',
          })
          .children(
            h.div
              .class(styles.header)
              .children(
                h.h3
                  .class(styles.heading)
                  .attr('id', `${id}-${side}-headline`)
                  .children(title),
                selected
                  ? !showClear
                    ? undefined
                    : list
                        .clear(
                          h.button
                            .class(styles.bulk)
                            .attr('type', 'button')
                            .disabled(!list.canClear),
                        )
                        .children('Clear')
                  : !showSelectAll
                    ? undefined
                    : list
                        .selectAll(
                          h.button
                            .class(styles.bulk)
                            .attr('type', 'button')
                            .disabled(!list.canSelectAll),
                        )
                        .children('Add all'),
              ),
            items.length === 0
              ? h.p
                  .class(styles.empty)
                  .children(list.query.trim() === '' ? empty : noResultsText)
              : h.ul
                  .class(styles.list)
                  .attrs({ 'data-slot': 'transfer-list-items', role: 'list' })
                  .children(
                    ...[...groups].map(([group, groupItems]) => [
                      group === undefined
                        ? undefined
                        : h.li
                            .key(`group:${group}`)
                            .class(styles.groupLabel)
                            .attr('role', 'presentation')
                            .children(group),
                      ...groupItems.map(item => {
                        const range =
                          selected && reorderable
                            ? transferListMovableRange(
                                value,
                                catalog,
                                item.value,
                              )
                            : undefined
                        const canReorder =
                          range !== undefined && range.start !== range.end
                        const grabbed = list.draftKey === item.value
                        const mark =
                          list.dropMark?.target === item.value
                            ? list.dropMark.after
                              ? 'after'
                              : 'before'
                            : undefined
                        const position = selected
                          ? list.order.indexOf(item.value)
                          : -1
                        const base = h.li
                          .key(item.value)
                          .class(styles.row)
                          .attrs({
                            'data-slot': 'transfer-list-item',
                            'data-grabbed': grabbed ? '' : undefined,
                            'data-drop': mark,
                          })
                          .style({
                            order: position < 0 ? undefined : String(position),
                          })
                        const row =
                          selected && reorderable
                            ? list.drop(base, item.value)
                            : base
                        return row.children(
                          selected && reorderable
                            ? list
                                .reorder(
                                  h.button
                                    .class(styles.action)
                                    .attrs({
                                      type: 'button',
                                      'data-slot': 'transfer-list-reorder',
                                      'aria-label': `Reorder ${item.label}`,
                                      'aria-pressed': String(grabbed),
                                      'aria-describedby': instructions,
                                      title: !canReorder
                                        ? item.disabledMessage
                                        : undefined,
                                    })
                                    .disabled(!canReorder),
                                  item.value,
                                )
                                .children(
                                  IconBehavior(h, {
                                    name: 'grip-vertical',
                                    size: 'sm',
                                  }),
                                )
                            : undefined,
                          h.div
                            .class(styles.option)
                            .children(renderOption?.(item) ?? item.label),
                          list
                            .action(
                              h.button
                                .class(styles.action)
                                .attrs({
                                  type: 'button',
                                  'data-slot': selected
                                    ? 'transfer-list-remove'
                                    : 'transfer-list-add',
                                  'aria-label': `${selected ? 'Remove' : 'Add'} ${item.label}`,
                                  title: item.isTransferDisabled
                                    ? item.disabledMessage
                                    : undefined,
                                })
                                .disabled(item.isTransferDisabled === true),
                              item.value,
                              side,
                            )
                            .children(
                              IconBehavior(h, {
                                name: selected ? 'x' : 'plus',
                                size: 'sm',
                              }),
                            ),
                        )
                      }),
                    ]),
                  ),
          )
      }
      return list
        .root(
          h.div.class(styles.root, className).attrs({
            id,
            'data-slot': 'transfer-list',
            role: 'group',
            'aria-labelledby': `${id}-label`,
            'aria-describedby':
              description === undefined ? undefined : `${id}-description`,
            tabindex: '-1',
          }),
        )
        .children(
          h.div
            .class(labelHidden ? styles.hidden : styles.label)
            .attr('id', `${id}-label`)
            .children(label),
          description === undefined
            ? undefined
            : h.p
                .class(styles.description)
                .attr('id', `${id}-description`)
                .children(description),
          hasSearch
            ? h.div.class(styles.searchWrap).children(
                IconBehavior(h, {
                  name: 'search',
                  size: 'sm',
                  className: styles.searchIcon,
                }),
                list.search(
                  h.input.class(styles.search).attrs({
                    type: 'text',
                    role: 'searchbox',
                    'data-slot': 'transfer-list-search',
                    'aria-label': searchLabel,
                    placeholder: searchPlaceholder,
                  }),
                ),
                list.query === ''
                  ? undefined
                  : list
                      .clearSearch(
                        h.button.class(styles.clearSearch).attrs({
                          type: 'button',
                          'aria-label': 'Clear search',
                          'data-slot': 'transfer-list-clear-search',
                        }),
                      )
                      .children(IconBehavior(h, { name: 'x', size: 'xs' })),
              )
            : undefined,
          reorderable
            ? h.p
                .class(styles.hidden)
                .attr('id', instructions)
                .children(
                  'Press Space or Enter to grab, arrow keys to move, and Space or Enter to drop. Press Escape to cancel.',
                )
            : undefined,
          h.div
            .class(styles.panels)
            .children(
              panel(
                'selected',
                selectedLabel,
                list.selected,
                selectedEmptyText,
              ),
              panel(
                'available',
                availableLabel,
                list.available,
                availableEmptyText,
              ),
            ),
          h.span
            .class(styles.hidden)
            .attrs({ 'aria-live': 'polite', 'aria-atomic': 'true' })
            .children(list.announcement),
        )
    },
  })
}
