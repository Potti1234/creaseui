import type { Html } from '@effect/ui/html'

import { ComboboxBehavior } from '../behaviors/combobox'

type ComboboxOptions<Msg> = Parameters<typeof ComboboxBehavior<Msg>>[1]
const tailwind = {
  group:
    'flex min-h-9 w-full min-w-0 items-center rounded-md border border-input bg-background px-2.5 py-0.5 text-sm shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30 data-disabled:opacity-50',
  input: 'min-w-0 flex-1 bg-transparent outline-none',
  chips: 'flex min-w-0 flex-1 flex-wrap items-center gap-1',
  chip: 'inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs',
  chipRemove:
    'grid size-5 place-items-center rounded hover:bg-background focus-visible:outline-2',
  trigger:
    'ml-1 grid size-6 place-items-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-2',
  positioner:
    'm-0 w-(--anchor-width) overflow-visible border-0 bg-transparent p-0',
  popup:
    'mt-1 max-h-(--available-height) overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
  groupLabel: 'px-2 py-1.5 text-xs font-medium text-muted-foreground',
  empty: 'px-2 py-1.5 text-sm text-muted-foreground empty:hidden',
  item: 'flex cursor-default items-center justify-between rounded-sm px-2 py-1.5 text-sm data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50',
}

export const Combobox = <Msg>(
  h: Html.H<Msg>,
  {
    label,
    placeholder,
    emptyText = 'No results found.',
    ...options
  }: Omit<ComboboxOptions<Msg>, 'view' | 'fallback'> & {
    readonly label: string
    readonly placeholder?: string
    readonly emptyText?: string
  },
  styles: typeof tailwind = tailwind,
) =>
  ComboboxBehavior(h, {
    ...options,
    view: combobox => {
      const item = ({ value, label }: (typeof combobox.items)[number]) =>
        combobox
          .item({
            element: h.div.key(`item:${value}`).class(styles.item),
            value,
          })
          .children(
            label,
            combobox
              .itemIndicator({
                element: h.span.attr('aria-hidden', 'true'),
                value,
              })
              ?.children('✓'),
          )
      return h.div(
        combobox
          .inputGroup(h.div.class(styles.group).attr('data-slot', 'combobox'))
          .children(
            combobox
              .chips(h.div.class(styles.chips))
              .children(
                combobox.multiple
                  ? combobox.selectedItems.map(({ value, label }) =>
                      combobox
                        .chip({
                          value,
                          element: h.div
                            .key(value)
                            .class(styles.chip)
                            .attr('data-slot', 'combobox-chip'),
                        })
                        .children(
                          label,
                          combobox
                            .chipRemove({
                              value,
                              element: h.button.class(styles.chipRemove),
                            })
                            .children('×'),
                        ),
                    )
                  : undefined,
                combobox.input(
                  h.input
                    .class(styles.input)
                    .attrs({ 'aria-label': label, placeholder }),
                ),
              ),
            combobox
              .trigger(
                h.button
                  .class(styles.trigger)
                  .attr('aria-label', 'Show options'),
              )
              .children(
                h
                  .el('svg')
                  .attrs({
                    width: '16',
                    height: '16',
                    viewBox: '0 0 24 24',
                    'aria-hidden': 'true',
                    fill: 'none',
                    stroke: 'currentColor',
                    'stroke-width': '2',
                  })
                  .children(h.el('path').attr('d', 'm6 9 6 6 6-6')),
              ),
          ),
        combobox
          .positioner(h.div.class(styles.positioner))
          .children(
            combobox
              .popup(h.div.class(styles.popup))
              .children(
                combobox.empty(h.div.class(styles.empty)).children(emptyText),
                combobox
                  .list(h.div)
                  .children(
                    ...combobox.groups.map(({ key, items }) =>
                      key === undefined
                        ? items.map(item)
                        : combobox
                            .group({
                              group: key,
                              element: h.div.key(`group:${key}`),
                            })
                            .children(
                              combobox
                                .groupLabel({
                                  group: key,
                                  element: h.div.class(styles.groupLabel),
                                })
                                .children(key),
                              items.map(item),
                            ),
                    ),
                  ),
              ),
          ),
      )
    },
  })
