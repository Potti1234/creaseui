import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { TabsBehavior, type TabsProps, type TabsTab } from '../behaviors/tabs'

type TabsOptions<Msg> = Parameters<typeof TabsBehavior<Msg>>[1]

const tailwind = {
  root: 'flex min-w-0 gap-3 data-[orientation=horizontal]:flex-col',
  list: 'inline-flex w-fit max-w-full shrink-0 gap-1 self-start overflow-x-auto rounded-lg bg-muted p-1 data-[orientation=vertical]:flex-col data-[variant=line]:rounded-none data-[variant=line]:bg-transparent',
  tab: 'relative inline-flex min-h-8 items-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-muted-foreground outline-none hover:text-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-active:bg-background data-active:text-foreground data-active:shadow-xs data-[variant=line]:bg-transparent data-[variant=line]:shadow-none data-[variant=line]:data-active:underline data-[variant=line]:decoration-2 data-[variant=line]:underline-offset-4',
  labelHidden: 'sr-only',
  panel:
    'min-w-0 flex-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
}

export type TabContent<Msg, R = never> = TabsTab & {
  readonly label: View.Input<Msg, R>
  readonly icon?: View.Input<Msg, R>
  readonly isLabelHidden?: boolean
  readonly content: View.Input<Msg, R> | View.Children<Msg, R>
}

export const Tabs = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    props,
    tabs,
    ariaLabel = 'Tabs',
    variant = 'default',
    direction,
    className,
    ...options
  }: Omit<TabsOptions<Msg>, 'props' | 'view' | 'fallback'> & {
    readonly props: Omit<TabsProps, 'tabs'>
    readonly tabs: ReadonlyArray<TabContent<NoInfer<Msg>, R>>
    readonly ariaLabel?: string
    readonly variant?: 'default' | 'line'
    readonly direction?: 'ltr' | 'rtl'
    readonly className?: string
  },
  styles: typeof tailwind = tailwind,
) =>
  TabsBehavior(h, {
    ...options,
    props: {
      activateOnFocus: true,
      ...props,
      tabs: tabs.map(({ value, disabled, keepMounted }) => ({
        value,
        disabled,
        keepMounted,
      })),
    },
    view: parts =>
      parts
        .root(
          h.div
            .class(styles.root, className)
            .attrs({ 'data-slot': 'tabs', dir: direction }),
        )
        .children(
          parts
            .list(
              h.div
                .class(styles.list)
                .attrs({
                  'aria-label': ariaLabel,
                  'data-slot': 'tabs-list',
                  'data-variant': variant,
                }),
            )
            .children(
              ...tabs.map(tab =>
                parts
                  .tab({
                    value: tab.value,
                    element: h.button
                      .class(styles.tab)
                      .attrs({
                        'data-slot': 'tabs-trigger',
                        'data-variant': variant,
                      }),
                  })
                  .children(
                    tab.icon === undefined
                      ? undefined
                      : h.span.attr('aria-hidden', 'true').children(tab.icon),
                    tab.isLabelHidden
                      ? h.span.class(styles.labelHidden).children(tab.label)
                      : tab.label,
                  ),
              ),
            ),
          ...tabs.map(tab =>
            parts
              .panel({
                value: tab.value,
                element: h.div
                  .class(styles.panel)
                  .attr('data-slot', 'tabs-content'),
              })
              ?.children(tab.content),
          ),
        ),
  })
