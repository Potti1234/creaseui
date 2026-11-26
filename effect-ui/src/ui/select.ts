import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'
import type { SelectItem } from '@effect/ui-kit'

import { SelectBehavior } from '../behaviors/select'

type SelectOptions<Msg> = Parameters<typeof SelectBehavior<Msg>>[1]

const tailwind = {
  label: 'text-sm font-medium',
  trigger:
    'flex h-8 w-fit max-w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-2.5 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground data-[variant=ghost]:bg-transparent data-[variant=ghost]:not-focus-visible:border-transparent data-[variant=ghost]:not-focus-visible:shadow-none data-[variant=ghost]:hover:bg-muted',
  value: 'min-w-0 truncate',
  icon: 'shrink-0 text-muted-foreground',
  backdrop: 'fixed inset-0 m-0 size-auto border-0 bg-transparent p-0',
  positioner:
    'm-0 w-max min-w-(--anchor-width) max-w-[min(var(--available-width),calc(100vw-1rem))] overflow-visible border-0 bg-transparent p-0',
  popup:
    'max-h-(--available-height) origin-(--transform-origin) overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none',
  item: 'flex cursor-default items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50',
  groupLabel: 'px-2 py-1.5 text-xs text-muted-foreground',
  separator: 'my-1 h-px bg-border',
}

export const Select = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    label,
    ariaLabel = label,
    invalid,
    variant = 'default',
    size = 'default',
    className,
    direction,
    groupForItem,
    groupLabel,
    renderItem,
    ...options
  }: Omit<SelectOptions<Msg>, 'view' | 'fallback'> & {
    readonly label?: string
    readonly ariaLabel?: string
    readonly invalid?: boolean
    readonly variant?: 'default' | 'ghost'
    readonly size?: 'default' | 'sm'
    readonly className?: string
    readonly direction?: 'ltr' | 'rtl'
    readonly groupForItem?: (item: SelectItem) => string
    readonly groupLabel?: (group: string) => string | undefined
    readonly renderItem?: (item: SelectItem) => View.Input<NoInfer<Msg>, R>
  },
  styles: typeof tailwind = tailwind,
) =>
  SelectBehavior(h, {
    ...options,
    view: select => {
      const itemView = (item: SelectItem) =>
        select
          .item({
            element: h.div.class(styles.item).attr('data-slot', 'select-item'),
            value: item.value,
          })
          .children(
            select.itemText(h.div).children(renderItem?.(item) ?? item.label),
            select
              .itemIndicator({ element: h.span, value: item.value })
              ?.children('✓'),
          )

      const groups = new Map<string, SelectItem[]>()
      if (groupForItem !== undefined) {
        for (const item of options.props.items) {
          const key = groupForItem(item)
          const items = groups.get(key)
          if (items === undefined) groups.set(key, [item])
          else items.push(item)
        }
      }
      const contents =
        groupForItem === undefined
          ? options.props.items.map(itemView)
          : Array.from(groups, ([group, items], index) => {
              const title = groupLabel?.(group) ?? group
              return [
                index === 0
                  ? undefined
                  : select.separator(h.div.class(styles.separator)),
                select
                  .group({ element: h.div, group })
                  .children(
                    select
                      .groupLabel({
                        element: h.div.class(styles.groupLabel),
                        group,
                      })
                      .children(title),
                    ...items.map(itemView),
                  ),
              ]
            }).flat()

      return h.div.attrs({ 'data-slot': 'select', dir: direction }).children(
        label === undefined
          ? undefined
          : select.label(h.div.class(styles.label)).children(label),
        select
          .trigger(
            h.button
              .class([styles.trigger, className].filter(Boolean).join(' '))
              .attrs({
                'aria-label': ariaLabel,
                'aria-invalid': invalid ? 'true' : undefined,
                'data-slot': 'select-trigger',
                'data-size': size,
                'data-variant': variant,
              }),
          )
          .children(
            select.value(
              h.span.class(styles.value).attr('data-slot', 'select-value'),
            ),
            select.icon(h.span.class(styles.icon)).children(
              h
                .el('svg')
                .attrs({
                  width: '16',
                  height: '16',
                  viewBox: '0 0 24 24',
                  fill: 'none',
                  stroke: 'currentColor',
                  'stroke-width': '2',
                })
                .children(h.el('path').attr('d', 'm6 9 6 6 6-6')),
            ),
          ),
        select.backdrop(h.div.class(styles.backdrop)),
        select
          .positioner(h.div.class(styles.positioner))
          .children(
            select
              .popup(
                h.div
                  .class(styles.popup)
                  .attrs({
                    'aria-label': ariaLabel,
                    'data-slot': 'select-content',
                  }),
              )
              .children(...contents),
          ),
      )
    },
  })
