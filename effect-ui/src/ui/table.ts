import type { Html } from '@effect/ui/html'

import { TableBehavior, type TableProps } from '../behaviors/table'

const tailwind = {
  container: 'relative w-full overflow-x-auto',
  root: 'w-full caption-bottom text-sm',
  header: '[&_tr]:border-b',
  body: '[&_tr:last-child]:border-0',
  footer: 'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
  row: 'border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-selected:bg-muted',
  head: 'h-10 px-2 text-start align-middle font-medium whitespace-nowrap text-foreground',
  cell: 'p-2 align-middle whitespace-nowrap',
  caption: 'mt-4 text-sm text-muted-foreground',
}

export const Table = <Msg, R = never>(
  h: Html.H<Msg>,
  options: TableProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => TableBehavior(h, options, styles)
