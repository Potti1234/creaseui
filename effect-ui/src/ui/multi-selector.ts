import type { Html } from '@effect/ui/html'

import { IconBehavior } from '../behaviors/icon'
import { MultiSelectorBehavior } from '../behaviors/multi-selector'
export {
  flattenMultiSelectorOptions,
  type MultiSelectorOption,
  type MultiSelectorSection,
} from '../behaviors/multi-selector'

type Options<Msg> = Parameters<typeof MultiSelectorBehavior<Msg>>[1]
export type MultiSelectorProps<Msg> = Omit<
  Options<Msg>,
  'view' | 'fallback'
> & {
  readonly id: string
  readonly label: string
  readonly labelHidden?: boolean
  readonly description?: string
  readonly optional?: boolean
  readonly disabledMessage?: string
  readonly placeholder?: string
  readonly searchPlaceholder?: string
  readonly emptyText?: string
  readonly showClear?: boolean
  readonly showSearchIcon?: boolean
  readonly triggerDisplay?: 'count' | 'labels' | 'badges'
  readonly badgeMaxCount?: number
  readonly width?: number | string
  readonly status?: {
    readonly type: 'error' | 'warning' | 'success'
    readonly message: string
  }
  readonly statusVariant?: 'attached' | 'detached' | 'tooltip'
  readonly variant?: 'input' | 'ghost'
  readonly doneLabel?: string
  readonly className?: string
}

const tailwind = {
  root: 'grid min-w-0 gap-1.5 text-sm',
  label: 'font-medium',
  hiddenLabel: 'sr-only',
  description: 'text-sm text-muted-foreground',
  row: 'flex min-w-0 items-center gap-0.5',
  trigger:
    'flex min-h-9 flex-1 min-w-0 items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1 text-start text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-[variant=ghost]:border-transparent data-[variant=ghost]:bg-transparent disabled:opacity-50 aria-invalid:border-destructive',
  triggerContent: 'flex min-w-0 flex-1 flex-wrap items-center gap-1',
  text: 'min-w-0 truncate',
  badge:
    'inline-flex max-w-full truncate rounded-sm bg-muted px-1.5 py-0.5 text-xs',
  icon: 'shrink-0 text-muted-foreground',
  clear:
    'inline-grid size-8 shrink-0 place-items-center rounded-md border-0 bg-transparent text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
  positioner:
    'm-0 min-w-(--anchor-width) max-w-[calc(100vw-1rem)] overflow-visible border-0 bg-transparent p-0',
  popup:
    'mt-1 grid max-h-(--available-height) min-w-44 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-ending-style:invisible',
  input:
    'w-full min-w-0 border-0 border-b border-border bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring',
  list: 'grid min-w-0 overflow-y-auto p-1',
  item: 'flex min-w-0 cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50',
  check:
    'inline-grid size-4 shrink-0 place-items-center rounded border border-input',
  groupLabel: 'px-2 py-1.5 text-xs font-medium text-muted-foreground',
  empty: 'px-2 py-2 text-sm text-muted-foreground empty:hidden',
  status:
    'rounded-md px-2 py-1 text-xs data-[type=error]:text-destructive data-[type=success]:text-success data-[type=warning]:text-warning data-[variant=attached]:bg-muted',
  overlay:
    'fixed inset-0 bg-black/50 opacity-[calc(1_-_var(--drawer-swipe-progress,0))] data-ending-style:opacity-0',
  viewport: 'fixed inset-0 flex items-end',
  sheet:
    'grid max-h-[80dvh] min-h-0 w-full gap-2 overflow-auto rounded-t-xl border bg-popover p-4 text-popover-foreground shadow-lg outline-none [translate:0_calc(var(--drawer-swipe-movement-y,0px)_+_var(--drawer-snap-point-offset,0px))] transition-[translate] duration-[calc(var(--drawer-swipe-strength,1)*320ms)] data-starting-style:[translate:0_100%] data-ending-style:[translate:0_100%] data-swiping:transition-none motion-reduce:transition-none',
  sheetTitle: 'text-base font-semibold',
  done: 'justify-self-end rounded-md border bg-background px-3 py-1.5 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
}

export const MultiSelector = <Msg>(
  h: Html.H<Msg>,
  {
    id,
    label,
    labelHidden,
    description,
    optional,
    disabledMessage,
    placeholder = 'Select options',
    searchPlaceholder = 'Search…',
    emptyText = 'No options found.',
    showClear,
    showSearchIcon,
    triggerDisplay = 'count',
    badgeMaxCount = 3,
    width,
    status,
    statusVariant = 'attached',
    variant = 'input',
    doneLabel = 'Done',
    className,
    ...options
  }: MultiSelectorProps<NoInfer<Msg>>,
  styles: typeof tailwind = tailwind,
) => {
  const {
    items,
    value,
    name,
    form,
    required,
    disabled,
    readOnly,
    hasSearch,
    presentation,
    dir,
  } = options.props
  const current = new Map(items.map(item => [item.value, item.label]))
  const selected = [...new Set(value)].map(key => ({
    key,
    label: current.get(key) ?? key,
  }))
  const badgeLimit = Math.max(0, Math.trunc(badgeMaxCount))
  const sheet = presentation === 'bottom-sheet'
  const labelId = `${id}-label`
  const statusId = `${id}-status`
  const descId = `${id}-description`
  const describedBy =
    [
      description === undefined ? undefined : descId,
      status === undefined ? undefined : statusId,
    ]
      .filter(Boolean)
      .join(' ') || undefined
  const summary =
    selected.length === 0
      ? placeholder
      : selected.map(item => item.label).join(', ')
  const content =
    selected.length === 0 || triggerDisplay !== 'badges'
      ? h.span
          .class(styles.text)
          .children(
            selected.length === 0 || triggerDisplay === 'labels'
              ? summary
              : `${selected.length} selected`,
          )
      : h.span.class(styles.triggerContent).children(
          selected
            .slice(0, badgeLimit)
            .map(item =>
              h.span.key(item.key).class(styles.badge).children(item.label),
            ),
          selected.length > badgeLimit
            ? h.span
                .class(styles.badge)
                .children(`+${selected.length - badgeLimit}`)
            : undefined,
        )
  return MultiSelectorBehavior(h, {
    ...options,
    key: options.key ?? id,
    view: ({ combobox, drawer, clear, allValue }) => {
      const button = h.button
        .class(styles.trigger)
        .attrs({
          id,
          type: 'button',
          'data-slot': 'multi-selector-trigger',
          'data-variant': variant,
          'aria-labelledby': `${labelId} ${id}-summary`,
          'aria-describedby': describedBy,
          'aria-invalid': status?.type === 'error' ? 'true' : undefined,
          title: disabled
            ? disabledMessage
            : statusVariant === 'tooltip'
              ? status?.message
              : undefined,
        })
        .disabled(disabled === true)
      const contents = [
        showSearchIcon
          ? IconBehavior(h, {
              name: 'search',
              size: 'sm',
              className: styles.icon,
            })
          : undefined,
        h.span
          .class(styles.triggerContent)
          .attr('id', `${id}-summary`)
          .children(content),
        IconBehavior(h, {
          name: 'chevron-down',
          size: 'xs',
          className: styles.icon,
        }),
      ] as const
      const input = combobox.input(
        h.input.class(hasSearch ? styles.input : styles.hiddenLabel).attrs({
          'data-slot': 'multi-selector-search',
          'aria-label': hasSearch ? `Search ${label}` : label,
          placeholder: hasSearch ? searchPlaceholder : undefined,
          'aria-describedby': describedBy,
        }),
      )
      const renderList = () =>
        combobox
          .list(
            h.div.class(styles.list).attrs({
              'data-slot': 'multi-selector-options',
              'aria-label': label,
            }),
          )
          .children(
            ...combobox.groups.map(({ key, items }, index) => {
              const elements = items.map(item =>
                combobox
                  .item({
                    element: h.div
                      .key(item.value)
                      .class(styles.item)
                      .attrs({
                        'data-slot': 'multi-selector-option',
                        'data-select-all':
                          item.value === allValue ? '' : undefined,
                      }),
                    value: item.value,
                  })
                  .children(
                    h.span
                      .class(styles.check)
                      .attr('aria-hidden', 'true')
                      .children(
                        combobox
                          .itemIndicator({ value: item.value, element: h.span })
                          ?.children('✓'),
                      ),
                    h.span.class(styles.text).children(item.label),
                  ),
              )
              return key === undefined
                ? elements
                : combobox
                    .group({ element: h.div.key(`group:${index}`), group: key })
                    .children(
                      combobox
                        .groupLabel({
                          element: h.div.class(styles.groupLabel),
                          group: key,
                        })
                        .children(key),
                      elements,
                    )
            }),
          )
      const panel = [
        hasSearch ? input : input.attr('readonly', ''),
        combobox.empty(h.div.class(styles.empty)).children(emptyText),
        renderList(),
      ] as const
      return h.div
        .class(styles.root, className)
        .attrs({ 'data-slot': 'multi-selector', dir })
        .style({
          width: typeof width === 'number' ? `${width}px` : width,
          maxWidth: '100%',
        })
        .children(
          h.label
            .class(labelHidden ? styles.hiddenLabel : styles.label)
            .attrs({ id: labelId, for: id })
            .children(
              label,
              optional ? ' (optional)' : required ? ' (required)' : undefined,
            ),
          description === undefined
            ? undefined
            : h.p
                .class(styles.description)
                .attr('id', descId)
                .children(description),
          h.div.class(styles.row).children(
            sheet
              ? drawer.trigger(button).children(contents)
              : combobox.trigger(button).children(contents),
            showClear && selected.length > 0
              ? clear(
                  h.button
                    .class(styles.clear)
                    .attrs({
                      type: 'button',
                      'aria-label': `Clear ${label}`,
                      'data-slot': 'multi-selector-clear',
                    })
                    .disabled(disabled === true || readOnly === true),
                ).children(IconBehavior(h, { name: 'x', size: 'sm' }))
              : undefined,
          ),
          sheet
            ? drawer
                .portal(h.dialog.attr('data-slot', 'multi-selector-dialog'))
                ?.children(
                  drawer.backdrop(h.div.class(styles.overlay)),
                  drawer
                    .viewport(h.div.class(styles.viewport))
                    .children(
                      drawer
                        .popup(
                          h.div
                            .class(styles.sheet)
                            .attr('data-slot', 'multi-selector-sheet'),
                        )
                        .children(
                          drawer
                            .title(h.h2.class(styles.sheetTitle))
                            .children(label),
                          drawer.content(h.div).children(panel),
                          drawer
                            .close(h.button.class(styles.done))
                            .children(doneLabel),
                        ),
                    ),
                )
            : combobox
                .positioner(h.div.class(styles.positioner))
                .children(
                  combobox
                    .popup(
                      h.div
                        .class(styles.popup)
                        .attr('data-slot', 'multi-selector-popup'),
                    )
                    .children(panel),
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
                  'data-slot': 'multi-selector-status',
                  'data-type': status.type,
                  'data-variant': statusVariant,
                })
                .children(status.message),
          name === undefined
            ? undefined
            : selected.map(item =>
                h.input.key(item.key).attrs({
                  type: 'hidden',
                  name,
                  form,
                  value: item.key,
                  disabled: disabled ? '' : undefined,
                }),
              ),
        )
    },
  })
}
