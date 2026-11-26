import type { Html } from '@effect/ui/html'
import {
  InputGroupBehavior,
  type InputGroupProps,
} from '../behaviors/input-group'

const tailwind = {
  root: 'grid min-w-0 rounded-md border border-input bg-background shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 data-[radius=xl]:rounded-2xl data-[radius=full]:rounded-full data-disabled:opacity-50 data-invalid:border-destructive has-[[aria-invalid=true]]:border-destructive',
  row: 'flex min-w-0 items-center',
  addon:
    'flex shrink-0 items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground select-none data-[align=block-start]:w-full data-[align=block-end]:w-full',
  control:
    'min-h-8 min-w-0 flex-1 bg-transparent px-2.5 py-1 text-base outline-none md:text-sm',
  text: 'inline-flex items-center gap-2 text-sm text-muted-foreground',
  button:
    'inline-flex items-center justify-center rounded-md px-2 text-sm data-[size=xs]:h-6 data-[size=sm]:h-8 data-[size=icon-xs]:size-6 data-[size=icon-sm]:size-8',
}
export const InputGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: InputGroupProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => InputGroupBehavior(h, options, styles)
