import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { IconBehavior } from '../behaviors/icon'
import { TokenizerBehavior } from '../behaviors/tokenizer'

type Options<Msg> = Parameters<typeof TokenizerBehavior<Msg>>[1]
export type TokenizerProps<Msg, R = never> = Omit<
  Options<Msg>,
  'view' | 'fallback'
> & {
  readonly id: string
  readonly label: string
  readonly labelHidden?: boolean
  readonly description?: string
  readonly optional?: boolean
  readonly placeholder?: string
  readonly emptyText?: string
  readonly showSearchIcon?: boolean
  readonly showClear?: boolean
  readonly tokenOverflowBehavior?: 'none' | 'unfocusedInline' | 'unfocusedLayer'
  readonly endContent?: View.Input<Msg, R>
  readonly resultCount?: string
  readonly size?: 'sm' | 'md' | 'lg'
  readonly width?: number | string
  readonly status?: {
    readonly type: 'error' | 'warning' | 'success'
    readonly message: string
  }
  readonly statusVariant?: 'attached' | 'detached' | 'tooltip'
  readonly className?: string
}

const tailwind = {
  root: 'grid min-w-0 gap-1.5 text-sm',
  label: 'font-medium',
  hiddenLabel: 'sr-only',
  description: 'text-sm text-muted-foreground',
  group:
    'group/tokenizer flex min-w-0 items-center gap-1 rounded-md border border-input bg-background px-2 py-1 outline-none focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 data-disabled:opacity-50 data-invalid:border-destructive data-[size=sm]:min-h-8 data-[size=md]:min-h-9 data-[size=lg]:min-h-10',
  chips:
    'flex min-w-0 flex-1 flex-wrap items-center gap-1 group-not-focus-within/tokenizer:data-overflow:flex-nowrap group-not-focus-within/tokenizer:data-overflow:overflow-hidden',
  chip: 'inline-flex max-w-full shrink-0 items-center gap-0.5 rounded-sm bg-muted px-1.5 py-0.5 text-xs text-foreground',
  chipText: 'min-w-0 truncate',
  chipRemove:
    'inline-grid size-4 shrink-0 place-items-center rounded-sm border-0 bg-transparent text-muted-foreground outline-none hover:bg-background focus-visible:ring-2 focus-visible:ring-ring',
  input:
    'min-w-12 flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-muted-foreground',
  icon: 'shrink-0 text-muted-foreground',
  clear:
    'inline-grid size-6 shrink-0 place-items-center rounded-md border-0 bg-transparent text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
  resultCount: 'shrink-0 text-xs text-muted-foreground',
  positioner:
    'm-0 min-w-(--anchor-width) max-w-[calc(100vw-1rem)] overflow-visible border-0 bg-transparent p-0',
  popup:
    'mt-1 grid max-h-(--available-height) min-w-44 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-ending-style:invisible',
  list: 'grid min-w-0 overflow-y-auto',
  item: 'flex min-w-0 cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground',
  empty: 'px-2 py-2 text-sm text-muted-foreground empty:hidden',
  status:
    'rounded-md px-2 py-1 text-xs data-[type=error]:text-destructive data-[type=success]:text-success data-[type=warning]:text-warning data-[variant=attached]:bg-muted',
}

export const Tokenizer = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    label,
    labelHidden,
    description,
    optional,
    placeholder,
    emptyText = 'No options found.',
    showSearchIcon,
    showClear,
    tokenOverflowBehavior = 'none',
    endContent,
    resultCount,
    size = 'md',
    width,
    status,
    statusVariant = 'attached',
    className,
    ...options
  }: TokenizerProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => {
  const { required, disabled, readOnly, dir, value } = options.props
  const statusId = `${id}-status`
  const descriptionId = `${id}-description`
  const describedBy =
    [
      description === undefined ? undefined : descriptionId,
      status === undefined ? undefined : statusId,
    ]
      .filter(Boolean)
      .join(' ') || undefined
  return TokenizerBehavior(h, {
    ...options,
    key: options.key ?? id,
    props: { ...options.props, id },
    view: ({ combobox, clear, openOnFocus, created, atMax }) =>
      h.div
        .class(styles.root, className)
        .attrs({ 'data-slot': 'tokenizer', dir })
        .style({
          width: typeof width === 'number' ? `${width}px` : width,
          maxWidth: '100%',
        })
        .children(
          h.label
            .class(labelHidden ? styles.hiddenLabel : styles.label)
            .attr('for', id)
            .children(
              label,
              optional ? ' (optional)' : required ? ' (required)' : undefined,
            ),
          description === undefined
            ? undefined
            : h.p
                .class(styles.description)
                .attr('id', descriptionId)
                .children(description),
          combobox
            .inputGroup(
              h.div.class(styles.group).attrs({
                'data-slot': 'tokenizer-group',
                'data-invalid': status?.type === 'error' ? '' : undefined,
                'data-size': size,
              }),
            )
            .children(
              showSearchIcon
                ? IconBehavior(h, {
                    name: 'search',
                    size: 'sm',
                    className: styles.icon,
                  })
                : undefined,
              combobox
                .chips(
                  h.div.class(styles.chips).attrs({
                    'data-slot': 'tokenizer-chips',
                    'data-overflow':
                      tokenOverflowBehavior === 'none'
                        ? undefined
                        : tokenOverflowBehavior,
                  }),
                )
                .children(
                  combobox.selectedItems.map(({ label, value }) =>
                    combobox
                      .chip({
                        value,
                        element: h.div
                          .key(value)
                          .class(styles.chip)
                          .attr('data-slot', 'tokenizer-token'),
                      })
                      .children(
                        h.span.class(styles.chipText).children(label),
                        disabled || readOnly
                          ? undefined
                          : combobox
                              .chipRemove({
                                value,
                                element: h.button
                                  .class(styles.chipRemove)
                                  .attrs({
                                    'data-slot': 'tokenizer-token-remove',
                                    'aria-label': `Remove ${label}`,
                                  }),
                              })
                              .children(
                                IconBehavior(h, { name: 'x', size: '2xs' }),
                              ),
                      ),
                  ),
                  openOnFocus(
                    combobox.input(
                      h.input.class(styles.input).attrs({
                        'data-slot': 'tokenizer-input',
                        'aria-describedby': describedBy,
                        'aria-invalid':
                          status?.type === 'error' ? 'true' : undefined,
                        placeholder:
                          value.length === 0 ? placeholder : undefined,
                        title:
                          statusVariant === 'tooltip'
                            ? status?.message
                            : undefined,
                      }),
                    ),
                  ),
                ),
              showClear && value.length > 0
                ? clear(
                    h.button
                      .class(styles.clear)
                      .attrs({
                        type: 'button',
                        'aria-label': `Clear ${label}`,
                        'data-slot': 'tokenizer-clear',
                      })
                      .disabled(disabled === true || readOnly === true),
                  ).children(IconBehavior(h, { name: 'x', size: 'sm' }))
                : undefined,
              resultCount === undefined
                ? undefined
                : h.span.class(styles.resultCount).children(resultCount),
              endContent,
            ),
          atMax
            ? undefined
            : combobox.positioner(h.div.class(styles.positioner)).children(
                combobox
                  .popup(
                    h.div
                      .class(styles.popup)
                      .attr('data-slot', 'tokenizer-popup'),
                  )
                  .children(
                    combobox
                      .empty(h.div.class(styles.empty))
                      .children(emptyText),
                    combobox
                      .list(
                        h.div
                          .class(styles.list)
                          .attr('data-slot', 'tokenizer-options'),
                      )
                      .children(
                        combobox.items.map(item =>
                          combobox
                            .item({
                              value: item.value,
                              element: h.div
                                .key(item.value)
                                .class(styles.item)
                                .attrs({
                                  'data-slot': 'tokenizer-option',
                                  'data-create':
                                    item.value === created ? '' : undefined,
                                }),
                            })
                            .children(
                              item.value === created
                                ? `Create “${item.label}”`
                                : item.label,
                            ),
                        ),
                      ),
                  ),
              ),
          status === undefined
            ? undefined
            : h.p
                .class(
                  statusVariant === 'tooltip'
                    ? styles.hiddenLabel
                    : styles.status,
                )
                .attrs({
                  id: statusId,
                  'data-slot': 'tokenizer-status',
                  'data-type': status.type,
                  'data-variant': statusVariant,
                })
                .children(status.message),
        ),
  })
}
