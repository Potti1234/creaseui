import type { Html } from '@effect/ui/html'

import {
  PaginationBehavior,
  type PaginationProps,
} from '../behaviors/pagination'
export {
  PaginationItemBehavior as PaginationItem,
  paginationItems,
} from '../behaviors/pagination'

const tailwind = {
  root: 'flex w-full justify-center',
  content: 'm-0 flex list-none flex-wrap items-center justify-center gap-1 p-0',
  link: 'inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border border-transparent bg-transparent px-2 text-sm font-medium text-foreground no-underline outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:border-input aria-disabled:pointer-events-none aria-disabled:opacity-50',
  ellipsis: 'inline-grid min-h-9 min-w-9 place-items-center',
}

export const Pagination = <Msg, R = never>(
  h: Html.H<Msg>,
  options: PaginationProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => PaginationBehavior(h, options, styles)
