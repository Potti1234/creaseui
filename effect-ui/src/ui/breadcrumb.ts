import type { Html } from '@effect/ui/html'

import {
  BreadcrumbBehavior,
  type BreadcrumbProps,
} from '../behaviors/breadcrumb'

const tailwind = {
  root: 'min-w-0',
  list: 'm-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-sm wrap-break-word text-muted-foreground sm:gap-2.5',
  item: 'inline-flex items-center gap-1.5',
  link: 'transition-colors hover:text-foreground',
  page: 'font-normal text-foreground',
  separator: 'select-none',
  ellipsis: 'inline-grid size-9 place-items-center',
}

export const Breadcrumb = <Msg, R = never>(
  h: Html.H<Msg>,
  options: BreadcrumbProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => BreadcrumbBehavior(h, options, styles)
