import type { Html } from '@effect/ui/html'
import {
  InputGroupBehavior,
  type InputGroupProps,
} from '../behaviors/input-group'

const tailwind = {
  root: 'group/input-group relative flex h-8 w-full min-w-0 items-center rounded-md border border-input shadow-xs transition-[color,box-shadow] outline-none dark:bg-input/30 has-[>textarea]:h-auto has-[>[data-align=inline-start]]:[&>input]:pl-2 has-[>[data-align=inline-end]]:[&>input]:pr-2 has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3 has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-[3px] has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot][aria-invalid=true]]:border-destructive data-[radius=xl]:rounded-2xl data-[radius=full]:rounded-full data-disabled:opacity-50',
  row: 'flex min-w-0 items-center',
  addon:
    "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
  control:
    'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-8 w-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-2.5 py-1 text-base shadow-none transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-0 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-transparent dark:aria-invalid:ring-destructive/40',
  text: 'inline-flex items-center gap-2 text-sm text-muted-foreground',
  button:
    'inline-flex items-center justify-center rounded-md px-2 text-sm data-[size=xs]:h-6 data-[size=sm]:h-8 data-[size=icon-xs]:size-6 data-[size=icon-sm]:size-8',
}
export const InputGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: InputGroupProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => InputGroupBehavior(h, options, styles)
