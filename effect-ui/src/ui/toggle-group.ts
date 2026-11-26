import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { ToggleGroupBehavior } from '../behaviors/toggle-group'

type Options<Msg> = Parameters<typeof ToggleGroupBehavior<Msg>>[1]

const tailwind = {
  root: 'inline-flex w-fit items-center data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-[arrangement=wrapped]:flex-wrap data-[arrangement=wrapped]:gap-1',
  item: 'relative inline-flex shrink-0 items-center justify-center px-3 text-sm font-medium outline-none hover:bg-muted focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 data-pressed:bg-accent data-pressed:text-accent-foreground data-[size=sm]:h-8 data-[size=default]:h-9 data-[size=lg]:h-10',
  outline: 'border border-input',
  separated: 'rounded-md',
  horizontal:
    'first:rounded-s-md last:rounded-e-md data-[variant=outline]:not-first:border-s-0',
  vertical:
    'first:rounded-t-md last:rounded-b-md data-[variant=outline]:not-first:border-t-0',
}

export const ToggleGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    props,
    ariaLabel,
    renderItem,
    arrangement = 'joined',
    variant = 'default',
    size = 'default',
    direction,
    className,
    ...options
  }: Omit<Options<Msg>, 'view' | 'fallback'> & {
    readonly ariaLabel: string
    readonly renderItem: (value: string) => {
      readonly children: View.Children<NoInfer<Msg>, R>
      readonly ariaLabel?: string
      readonly className?: string
    }
    readonly arrangement?: 'joined' | 'wrapped'
    readonly variant?: 'default' | 'outline'
    readonly size?: 'default' | 'sm' | 'lg'
    readonly direction?: 'ltr' | 'rtl'
    readonly className?: string
  },
  styles: typeof tailwind = tailwind,
) =>
  ToggleGroupBehavior(h, {
    ...options,
    props,
    view: group =>
      group
        .root(
          h.div.class(styles.root, className).attrs({
            'data-slot': 'toggle-group',
            'aria-label': ariaLabel,
            'data-arrangement': arrangement,
            dir: direction,
          }),
        )
        .children(
          props.items.map(({ value }) => {
            const item = renderItem(value)
            return group
              .item({
                value,
                element: h.button
                  .key(value)
                  .class(
                    styles.item,
                    variant === 'outline' && styles.outline,
                    arrangement === 'wrapped'
                      ? styles.separated
                      : styles[group.orientation],
                    item.className,
                  )
                  .attrs({
                    'data-slot': 'toggle-group-item',
                    'data-size': size,
                    'data-variant': variant,
                    'aria-label': item.ariaLabel,
                  }),
              })
              .children(item.children)
          }),
        ),
  })
