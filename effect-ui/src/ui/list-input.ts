import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { IconBehavior } from '../behaviors/icon'
import {
  ListInputBehavior,
  moveListInputItem,
  resolveColumnTrack,
  type ListInputColumnWidth,
} from '../behaviors/list-input'

export type ListInputStatus = {
  readonly type: 'error' | 'warning' | 'success'
  readonly message?: string
}
export type ListInputChange =
  | { readonly type: 'add'; readonly index: number }
  | {
      readonly type: 'update'
      readonly index: number
      readonly columnKey: string
    }
  | { readonly type: 'remove'; readonly index: number }
  | {
      readonly type: 'reorder'
      readonly fromIndex: number
      readonly toIndex: number
    }
export type ListInputColumn<T, Msg, R = never> = {
  readonly key: string
  readonly header: string
  readonly width?: ListInputColumnWidth
  readonly renderInput: (context: {
    readonly item: T
    readonly index: number
    readonly columnKey: string
    readonly label: string
    readonly isLabelHidden: boolean
    readonly status: ListInputStatus | undefined
    readonly statusVariant: 'tooltip'
    readonly isDisabled: boolean
    readonly isLoading: boolean
    readonly updateItem: (item: T, columnKey?: string) => Msg | undefined
  }) => View.Input<Msg, R>
}
export type ListInputProps<T, Msg, R = never> = {
  readonly id: string
  readonly value: readonly T[]
  readonly label: View.Input<Msg, R>
  readonly description?: View.Input<Msg, R>
  readonly getItemKey: (item: T) => string | number
  readonly createItem: () => T
  readonly columns: readonly ListInputColumn<T, Msg, R>[]
  readonly onChange: (
    value: readonly T[],
    change: ListInputChange,
  ) => Msg | undefined
  readonly itemName?: string
  readonly status?: ListInputStatus
  readonly getItemStatus?: (
    item: T,
    index: number,
  ) => ListInputStatus | undefined
  readonly getFieldStatus?: (
    item: T,
    columnKey: string,
    index: number,
  ) => ListInputStatus | undefined
  readonly beforeRemove?: (item: T, index: number) => boolean
  readonly reorderable?: boolean
  readonly disabled?: boolean
  readonly loading?: boolean
  readonly maxItems?: number
  readonly labelHidden?: boolean
  readonly optional?: boolean
  readonly required?: boolean
  readonly className?: string
}

const tailwind = {
  root: '@container/list-input grid min-w-0 w-full gap-2',
  label: 'text-sm font-medium',
  hidden: 'sr-only',
  description: 'text-sm text-muted-foreground',
  headers:
    'grid w-full items-center gap-2 text-xs font-medium text-muted-foreground @max-[640px]/list-input:hidden',
  list: 'm-0 flex list-none flex-col gap-2 p-0',
  row: 'grid min-w-0 w-full items-start gap-2 rounded-md transition-colors data-grabbed:bg-accent @max-[640px]/list-input:grid-cols-1 @max-[640px]/list-input:border @max-[640px]/list-input:p-2',
  field: 'min-w-0',
  fieldLabel: 'mb-1 block text-xs font-medium @min-[641px]/list-input:hidden',
  actions: 'flex items-center justify-end gap-1',
  iconButton:
    'inline-grid size-7 shrink-0 place-items-center rounded-sm border-0 bg-transparent text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40',
  add: 'inline-flex min-h-8 w-full items-center justify-center gap-1.5 rounded-md border-0 bg-secondary px-2.5 py-1 text-sm font-medium text-secondary-foreground outline-none hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40',
  status:
    'text-xs data-[type=error]:text-destructive data-[type=warning]:text-warning data-[type=success]:text-success',
}

export const ListInput = <T, Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    value,
    label,
    description,
    getItemKey,
    createItem,
    columns,
    onChange,
    itemName = 'item',
    status,
    getItemStatus,
    getFieldStatus,
    beforeRemove,
    reorderable,
    disabled,
    loading = false,
    maxItems,
    labelHidden,
    optional,
    required,
    className,
  }: ListInputProps<T, NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => {
  const keys = value.map(item => String(getItemKey(item)))
  const unavailable = disabled === true || loading
  const canAdd =
    !unavailable && (maxItems === undefined || value.length < maxItems)
  const controlGrid = [
    ...columns.map(column => resolveColumnTrack(column.width)),
    'max-content',
  ].join(' ')
  const renderStatus = (
    status: ListInputStatus | undefined,
    statusId?: string,
  ) =>
    status?.message === undefined
      ? undefined
      : h.p
          .class(styles.status)
          .attrs({
            id: statusId,
            'data-type': status.type,
            'data-slot': 'list-input-status',
          })
          .children(status.message)
  return ListInputBehavior(h, {
    key: id,
    props: { keys, canAdd, disabled: unavailable, reorderable, itemName },
    onEmit: {
      Added: () =>
        onChange([...value, createItem()], {
          type: 'add',
          index: value.length,
        }),
      Removed: ({ key }) => {
        const index = keys.indexOf(key)
        return index < 0
          ? undefined
          : onChange(
              value.filter((_, row) => row !== index),
              { type: 'remove', index },
            )
      },
      Reordered: ({ from, to }) =>
        onChange(moveListInputItem(value, from, to), {
          type: 'reorder',
          fromIndex: from,
          toIndex: to,
        }),
    },
    view: list =>
      h.div
        .class(styles.root, className)
        .attrs({
          id,
          'data-slot': 'list-input',
          role: 'group',
          'aria-labelledby': `${id}-label`,
          'aria-describedby':
            [
              description === undefined ? undefined : `${id}-description`,
              status?.message === undefined ? undefined : `${id}-status`,
            ]
              .filter(Boolean)
              .join(' ') || undefined,
          'aria-busy': loading ? 'true' : undefined,
        })
        .style({ '--list-input-columns': controlGrid })
        .children(
          h.div
            .class(labelHidden ? styles.hidden : styles.label)
            .attr('id', `${id}-label`)
            .children(
              label,
              optional ? ' (optional)' : required ? ' (required)' : undefined,
            ),
          description === undefined
            ? undefined
            : h.p
                .class(styles.description)
                .attr('id', `${id}-description`)
                .children(description),
          columns.length > 0 && value.length > 0
            ? h.div
                .class(styles.headers)
                .style({ gridTemplateColumns: controlGrid })
                .attrs({
                  'data-slot': 'list-input-headers',
                  'aria-hidden': 'true',
                })
                .children(
                  columns.map(column =>
                    h.span.key(column.key).children(column.header),
                  ),
                )
            : undefined,
          h.ul
            .class(styles.list)
            .attrs({ role: 'list', 'data-slot': 'list-input-rows' })
            .children(
              value.map((item, index) => {
                const key = keys[index] ?? String(index)
                const position = Math.max(0, list.order.indexOf(key))
                const status = getItemStatus?.(item, index)
                const grabbed = list.draftKey === key
                return h.li
                  .key(key)
                  .class(styles.row)
                  .attrs({
                    'data-slot': 'list-input-row',
                    'data-grabbed': grabbed ? '' : undefined,
                    'aria-label': `${itemName} ${position + 1}`,
                    'aria-describedby':
                      status?.message === undefined
                        ? undefined
                        : `${id}-row-${position}-status`,
                  })
                  .style({
                    gridTemplateColumns: controlGrid,
                    order: String(position),
                  })
                  .children(
                    columns.map(column =>
                      h.div
                        .key(column.key)
                        .class(styles.field)
                        .children(
                          h.span
                            .class(styles.fieldLabel)
                            .attr('aria-hidden', 'true')
                            .children(column.header),
                          column.renderInput({
                            item,
                            index,
                            columnKey: column.key,
                            label: `${column.header}, ${itemName} ${position + 1}`,
                            isLabelHidden: true,
                            status: getFieldStatus?.(item, column.key, index),
                            statusVariant: 'tooltip',
                            isDisabled: unavailable,
                            isLoading: loading,
                            updateItem: (updated, columnKey = column.key) =>
                              onChange(
                                value.map((entry, row) =>
                                  row === index ? updated : entry,
                                ),
                                { type: 'update', index, columnKey },
                              ),
                          }),
                        ),
                    ),
                    h.div.class(styles.actions).children(
                      reorderable
                        ? list
                            .reorder(
                              h.button
                                .class(styles.iconButton)
                                .attrs({
                                  type: 'button',
                                  'data-slot': 'list-input-reorder',
                                  'aria-label': `Reorder ${itemName} ${position + 1}`,
                                  'aria-pressed': String(grabbed),
                                  'aria-describedby': `${id}-reorder-instructions`,
                                })
                                .disabled(unavailable || value.length < 2),
                              key,
                            )
                            .children(
                              IconBehavior(h, {
                                name: 'grip-vertical',
                                size: 'sm',
                              }),
                            )
                        : undefined,
                      list
                        .remove(
                          h.button
                            .class(styles.iconButton)
                            .attrs({
                              type: 'button',
                              'data-slot': 'list-input-remove',
                              'aria-label': `Remove ${itemName} ${position + 1}`,
                            })
                            .disabled(unavailable),
                          key,
                          () => beforeRemove?.(item, index) !== false,
                        )
                        .children(IconBehavior(h, { name: 'x', size: 'sm' })),
                    ),
                    renderStatus(status, `${id}-row-${position}-status`),
                  )
              }),
            ),
          list
            .add(
              h.button
                .class(styles.add)
                .attr('data-slot', 'list-input-add')
                .attr('type', 'button')
                .disabled(!canAdd),
            )
            .children(
              IconBehavior(h, { name: 'plus', size: 'sm' }),
              `Add ${itemName}`,
            ),
          renderStatus(status, `${id}-status`),
          reorderable
            ? h.p
                .class(styles.hidden)
                .attr('id', `${id}-reorder-instructions`)
                .children(
                  'Use arrow keys to move. Press Space or Enter to grab or drop. Press Escape to cancel.',
                )
            : undefined,
          h.span
            .class(styles.hidden)
            .attrs({ 'aria-live': 'assertive', 'aria-atomic': 'true' })
            .children(list.announcement),
        ),
  })
}
