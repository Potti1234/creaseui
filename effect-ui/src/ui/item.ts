import type { Html } from '@effect/ui/html'
import {
  ItemBehavior,
  ItemGroupBehavior,
  type ItemGroupProps,
  type ItemProps,
} from '../behaviors/item'

export const itemClasses = {
  root: 'flex flex-wrap items-center rounded-md border border-transparent text-sm outline-none data-[variant=outline]:border-border data-[variant=muted]:bg-muted/50 data-[size=default]:gap-3 data-[size=default]:p-3 data-[size=sm]:gap-2.5 data-[size=sm]:px-3 data-[size=sm]:py-2.5 data-[size=xs]:gap-2 data-[size=xs]:px-2.5 data-[size=xs]:py-2 data-[element=a]:hover:bg-accent/50 focus-visible:ring-3 focus-visible:ring-ring/50',
  media:
    'flex shrink-0 items-center justify-center gap-2 data-[variant=icon]:size-8 data-[variant=icon]:rounded-sm data-[variant=icon]:border data-[variant=icon]:bg-muted data-[variant=image]:size-10 data-[variant=image]:overflow-hidden data-[variant=image]:rounded-sm',
  content: 'flex min-w-0 flex-1 flex-col gap-1',
  title: 'flex w-fit items-center gap-2 text-sm leading-snug font-medium',
  description: 'm-0 line-clamp-2 text-sm text-balance text-muted-foreground',
  actions: 'flex items-center gap-2',
  header: 'flex basis-full items-center justify-between gap-2',
  footer: 'flex basis-full items-center justify-between gap-2',
  group: 'flex flex-col',
  listItem: 'contents',
  separator: 'h-px w-full shrink-0 bg-border',
}

export const Item = <Msg, R = never>(
  h: Html.H<Msg>,
  options: ItemProps<NoInfer<Msg>, R>,
  styles: typeof itemClasses = itemClasses,
) => ItemBehavior(h, options, styles)
export const ItemGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: ItemGroupProps<NoInfer<Msg>, R>,
  styles: typeof itemClasses = itemClasses,
) => ItemGroupBehavior(h, options, styles)
