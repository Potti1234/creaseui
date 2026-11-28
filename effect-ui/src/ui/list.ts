import type { Html } from '@effect/ui/html'
import { ListBehavior, type ListProps } from '../behaviors/list'

const tailwind = {
  root: 'flex min-w-0 flex-col',
  header: 'mb-2',
  list: 'm-0',
  item: 'rounded-md aria-current:bg-primary/10 aria-disabled:opacity-50 data-dividers:rounded-none data-dividers:border-b data-dividers:last:border-b-0 data-[density=compact]:py-1 data-[density=balanced]:py-2 data-[density=spacious]:py-3 data-[density=spacious]:px-3 px-2 data-[edge-compensation=inline]:ms-[calc(-1*min(0.5rem,var(--container-padding-inline-start,0px)))] data-[edge-compensation=inline]:me-[calc(-1*min(0.5rem,var(--container-padding-inline-end,0px)))]',
  row: 'flex min-w-0 items-center gap-2',
  control:
    'flex min-w-0 flex-1 flex-col rounded-sm border-0 bg-transparent p-0 text-start text-sm text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring',
  description: 'text-xs text-muted-foreground',
  side: 'inline-flex shrink-0',
}
export const List = <Msg, R = never>(
  h: Html.H<Msg>,
  options: ListProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => ListBehavior(h, options, styles)
